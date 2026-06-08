import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type CorGenius = 'vermelho' | 'amarelo' | 'verde' | 'azul';

export interface EstadoJogo {
  tela: 'inicio' | 'piscando' | 'aguardando' | 'certo' | 'errado';
  fase: number;
  seq_len: number;
  entrada: string[];
}

interface MqttContextValue {
  connected: boolean;
  backendConnected: boolean;
  embarcadoConnected: boolean;
  estado: EstadoJogo | null;
  enviarLed: (cor: CorGenius) => Promise<void>;
  enviarJogo: (acao: 'iniciar' | 'reiniciar' | 'confirmar') => Promise<void>;
  resetarEstadoJogo: () => void;
}

const API_BASE = '/api';

const MqttContext = createContext<MqttContextValue | null>(null);

const ESTADO_INICIAL: EstadoJogo = {
  tela: 'inicio',
  fase: 1,
  seq_len: 0,
  entrada: [],
};

async function assertResponseOk(response: Response) {
  if (response.ok) {
    return;
  }

  const body = await response.text();
  throw new Error(`HTTP ${response.status}: ${body}`);
}

function useMqttState(): MqttContextValue {
  const [backendConnected, setBackendConnected] = useState(false);
  const [embarcadoConnected, setEmbarcadoConnected] = useState(false);
  const [estado, setEstado] = useState<EstadoJogo | null>(null);
  const socketRef = useRef<any>(null);

  const refreshEmbarcadoStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/embarcado/status`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setBackendConnected(true);
      const online = typeof data?.online === 'boolean' ? data.online : false;
      setEmbarcadoConnected(online);
    } catch {
      setBackendConnected(false);
      setEmbarcadoConnected(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function connect() {
      try {
        const { io } = await import('socket.io-client');
        const socket = io(window.location.origin, {
          path: '/api/socket.io',
          reconnection: true,
          reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
          if (mounted) setBackendConnected(true);
        });

        socket.on('disconnect', () => {
          if (mounted) {
            setBackendConnected(false);
          }
        });

        socket.on('estado', (data: EstadoJogo) => {
          if (mounted) setEstado(data);
        });

        socket.on('embarcado-status', (data: { online?: boolean; status?: string } | boolean | string) => {
          if (!mounted) return;

          let online = false;

          if (typeof data === 'boolean') {
            online = data;
          } else if (typeof data === 'string') {
            const value = data.trim().toLowerCase();
            online = value === 'online' || value === 'true' || value === '1';
          } else if (data && typeof data === 'object') {
            if (typeof data.online === 'boolean') {
              online = data.online;
            } else if (typeof data.status === 'string') {
              const value = data.status.trim().toLowerCase();
              online = value === 'online' || value === 'true' || value === '1';
            }
          }

          setEmbarcadoConnected(online);
        });

        socket.on('connect_error', () => {
          if (mounted) {
            setBackendConnected(false);
          }
        });

        socketRef.current = socket;
      } catch (e) {
        console.error('Erro ao conectar WebSocket:', e);
      }
    }

    connect();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    refreshEmbarcadoStatus();

    const intervalId = window.setInterval(() => {
      refreshEmbarcadoStatus();
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshEmbarcadoStatus]);

  const enviarLed = useCallback(async (cor: CorGenius) => {
    try {
      const response = await fetch(`${API_BASE}/jogo/led`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cor }),
      });

      await assertResponseOk(response);
    } catch (e) {
      console.error('Erro ao enviar LED:', e);
    }
  }, []);

  const enviarJogo = useCallback(async (acao: 'iniciar' | 'reiniciar' | 'confirmar') => {
    try {
      const response = await fetch(`${API_BASE}/jogo/${acao}`, {
        method: 'POST',
      });

      await assertResponseOk(response);
    } catch (e) {
      console.error('Erro ao enviar comando:', e);
    }
  }, []);

  const resetarEstadoJogo = useCallback(() => {
    setEstado(ESTADO_INICIAL);
  }, []);

  const connected = backendConnected && embarcadoConnected;

  return {
    connected,
    backendConnected,
    embarcadoConnected,
    estado,
    enviarLed,
    enviarJogo,
    resetarEstadoJogo,
  };
}

export function MqttProvider({ children }: { children: ReactNode }) {
  const value = useMqttState();

  return <MqttContext.Provider value={value}>{children}</MqttContext.Provider>;
}

export function useMqtt() {
  const value = useContext(MqttContext);

  if (!value) {
    throw new Error('useMqtt deve ser usado dentro de MqttProvider');
  }

  return value;
}
