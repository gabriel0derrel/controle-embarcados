import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMqtt } from '../hooks/useMqtt';
import type { CorGenius } from '../hooks/useMqtt';
import { GeniusPad } from '../components/GeniusPad';

const LAST_GAME_PHASE_KEY = 'genius:lastGamePhase';

function limparFaseFinalSalva() {
  localStorage.removeItem(LAST_GAME_PHASE_KEY);
}

export function JogoPage() {
  const navigate = useNavigate();
  const { connected, estado, enviarLed, enviarJogo } = useMqtt();
  const lastAutoConfirmKeyRef = useRef<string | null>(null);
  const lastGameOverPhaseRef = useRef<number | null>(null);

  const handleColorPress = (cor: CorGenius) => {
    void enviarLed(cor);
  };

  const handleIniciar = () => {
    limparFaseFinalSalva();
    void enviarJogo('iniciar');
  };

  const handleReiniciar = () => {
    limparFaseFinalSalva();
    void enviarJogo('reiniciar');
  };

  useEffect(() => {
    if (!estado || estado.tela !== 'aguardando') {
      lastAutoConfirmKeyRef.current = null;
      return;
    }

    const sequenceComplete =
      estado.seq_len > 0 && estado.entrada.length === estado.seq_len;

    if (!sequenceComplete) {
      lastAutoConfirmKeyRef.current = null;
      return;
    }

    const confirmKey = `${estado.fase}:${estado.seq_len}:${estado.entrada.join(',')}`;

    if (lastAutoConfirmKeyRef.current === confirmKey) {
      return;
    }

    lastAutoConfirmKeyRef.current = confirmKey;
    void enviarJogo('confirmar');
  }, [enviarJogo, estado]);

  useEffect(() => {
    if (!estado || estado.tela !== 'errado') {
      if (estado?.tela !== 'errado') {
        lastGameOverPhaseRef.current = null;
      }
      return;
    }

    if (lastGameOverPhaseRef.current === estado.fase) {
      return;
    }

    lastGameOverPhaseRef.current = estado.fase;
    localStorage.setItem(LAST_GAME_PHASE_KEY, String(estado.fase));
    navigate('/ranking', {
      state: { faseFinal: estado.fase },
      replace: true,
    });
  }, [estado, navigate]);

  const aguardaConfirmacao =
    estado?.tela === 'aguardando' &&
    estado.seq_len > 0 &&
    estado.entrada.length === estado.seq_len;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-3 p-md-4">

              {/* Status */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className={`rounded-circle ${connected ? 'bg-success' : 'bg-danger'}`} style={{ width: '8px', height: '8px' }}></span>
                  <small className="text-secondary fw-medium">
                    {connected ? 'Embarcado Conectado' : 'Embarcado Desconectado'}
                  </small>
                </div>
              </div>

              {/* Placar */}
              <div className="text-center mb-4">
                <div className="small text-secondary">Fase</div>
                <div className="display-6 fw-bold text-primary">{estado?.fase ?? '-'}</div>
              </div>

              {/* Estado do jogo */}
              {estado && (
                <div className="text-center mb-3">
                  <span className={`badge ${
                    estado.tela === 'aguardando' ? 'bg-success' :
                    estado.tela === 'piscando' ? 'bg-warning' :
                    estado.tela === 'certo' ? 'bg-info' :
                    estado.tela === 'errado' ? 'bg-danger' :
                    'bg-secondary'
                  } rounded-pill px-3 py-2`}>
                    {estado.tela === 'inicio' && 'Aguardando início'}
                    {estado.tela === 'piscando' && 'Observe a sequência...'}
                    {estado.tela === 'aguardando' && 'Sua vez!'}
                    {estado.tela === 'certo' && 'Acertou!'}
                    {estado.tela === 'errado' && 'Errou!'}
                  </span>
                </div>
              )}

              {/* Pad Genius */}
              <GeniusPad
                onColorPress={handleColorPress}
                disabled={!connected || estado?.tela !== 'aguardando' || aguardaConfirmacao}
              />

              {/* Botões de controle */}
              <div className="d-flex gap-2 mt-4">
                {!estado || estado.tela === 'inicio' ? (
                  <button
                    className="btn btn-dark fw-semibold flex-fill d-flex align-items-center justify-content-center gap-2"
                    onClick={handleIniciar}
                    disabled={!connected}
                  >
                    <i className="bi bi-play-fill"></i>
                    Iniciar
                  </button>
                ) : (
                  <button
                    className="btn btn-outline-dark fw-semibold flex-fill d-flex align-items-center justify-content-center gap-2"
                    onClick={handleReiniciar}
                  >
                    <i className="bi bi-arrow-counterclockwise"></i>
                    Reiniciar
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
