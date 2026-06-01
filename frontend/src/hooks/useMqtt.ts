import { useState, useEffect, useCallback, useRef } from 'react';
import type { EstadoJogo, CorGenius } from '../types/jogo';

export type { EstadoJogo, CorGenius };

const API_BASE = '/api';

export function useMqtt() {
  const [connected, setConnected] = useState(false);
  const [estado, setEstado] = useState<EstadoJogo | null>(null);
  const socketRef = useRef<any>(null);

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
          if (mounted) setConnected(true);
        });

        socket.on('disconnect', () => {
          if (mounted) setConnected(false);
        });

        socket.on('estado', (data: EstadoJogo) => {
          if (mounted) setEstado(data);
        });

        socket.on('connect_error', () => {
          if (mounted) setConnected(false);
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

  const enviarLed = useCallback(async (cor: CorGenius) => {
    try {
      await fetch(`${API_BASE}/jogo/led`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cor }),
      });
    } catch (e) {
      console.error('Erro ao enviar LED:', e);
    }
  }, []);

  const enviarJogo = useCallback(async (acao: 'iniciar' | 'reiniciar' | 'confirmar' | 'cancelar') => {
    try {
      await fetch(`${API_BASE}/jogo/${acao}`, {
        method: 'POST',
      });
    } catch (e) {
      console.error('Erro ao enviar comando:', e);
    }
  }, []);

  return {
    connected,
    estado,
    enviarLed,
    enviarJogo,
  };
}
