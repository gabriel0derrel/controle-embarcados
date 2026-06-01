import { useMqtt } from '../hooks/useMqtt';
import type { CorGenius } from '../types/jogo';
import { GeniusPad } from '../components/GeniusPad';

export function JogoPage() {
  const { connected, estado, enviarLed, enviarJogo } = useMqtt();

  const handleColorPress = (cor: CorGenius) => {
    enviarLed(cor);
  };

  const handleIniciar = () => {
    enviarJogo('iniciar');
  };

  const handleReiniciar = () => {
    enviarJogo('reiniciar');
  };

  const handleConfirmar = () => {
    enviarJogo('confirmar');
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">

              {/* Status */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2">
                  <span className={`rounded-circle ${connected ? 'bg-success pulse-green' : 'bg-danger'}`} style={{ width: '8px', height: '8px' }}></span>
                  <small className="text-secondary fw-medium">
                    {connected ? 'MQTT Conectado' : 'Desconectado'}
                  </small>
                </div>
                {estado && (
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
                    Fase {estado.fase}
                  </span>
                )}
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
                disabled={!connected || estado?.tela !== 'aguardando'}
                entrada={estado?.entrada}
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
                  <>
                    <button
                      className="btn btn-outline-dark fw-semibold flex-fill d-flex align-items-center justify-content-center gap-2"
                      onClick={handleReiniciar}
                    >
                      <i className="bi bi-arrow-counterclockwise"></i>
                      Reiniciar
                    </button>
                    {estado.tela === 'aguardando' && estado.entrada.length === estado.seq_len && (
                      <button
                        className="btn btn-dark fw-semibold flex-fill d-flex align-items-center justify-content-center gap-2"
                        onClick={handleConfirmar}
                      >
                        <i className="bi bi-check-lg"></i>
                        Confirmar
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Entrada do jogador */}
              {estado && estado.tela === 'aguardando' && (
                <div className="mt-3 text-center">
                  <small className="text-secondary">
                    Entrada: {estado.entrada.length} / {estado.seq_len}
                  </small>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
