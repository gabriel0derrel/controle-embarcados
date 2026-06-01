import React from 'react';

interface InicioScreenProps {
  onStartGame: () => void;
}

export const InicioScreen: React.FC<InicioScreenProps> = ({ onStartGame }) => {
  return (
    <div className="container py-4">
      <div className="row align-items-center g-5 mt-2">

        {/* Coluna Esquerda - Texto */}
        <div className="col-12 col-lg-6 text-center text-lg-start">
          <h1 className="display-2 genius-title mb-3">
            Genius
          </h1>

          <p className="fs-5 text-secondary mb-4 mx-auto mx-lg-0" style={{ maxWidth: '460px' }}>
            Controle dispositivos embarcados remotamente. Jogue contra o hardware físico via MQTT em tempo real.
          </p>
        </div>

        {/* Coluna Direita - Card */}
        <div className="col-12 col-md-8 col-lg-5 mx-auto ms-lg-auto">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              {/* Status */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="rounded-circle bg-success pulse-green" style={{ width: '8px', height: '8px' }}></span>
                <small className="text-secondary fw-medium">Dispositivo Conectado</small>
              </div>

              {/* Grid Genius */}
              <div
                className="mx-auto mb-3"
                style={{
                  width: '200px',
                  height: '200px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px',
                }}
              >
                <div className="rounded-3" style={{ backgroundColor: 'var(--genius-green)', opacity: 0.85 }}></div>
                <div className="rounded-3" style={{ backgroundColor: 'var(--genius-red)', opacity: 0.85 }}></div>
                <div className="rounded-3" style={{ backgroundColor: 'var(--genius-yellow)', opacity: 0.85 }}></div>
                <div className="rounded-3" style={{ backgroundColor: 'var(--genius-blue)', opacity: 0.85 }}></div>
              </div>

              {/* Info */}
              <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                <div>
                  <div className="small fw-medium text-dark">ESP32 Genius #1</div>
                  <div className="small text-secondary">192.168.1.100</div>
                </div>
                <span className="badge bg-success-subtle text-success rounded-pill px-3">Online</span>
              </div>

              {/* Botão */}
              <div className="d-grid mt-4">
                <button
                  onClick={onStartGame}
                  className="btn btn-dark fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-play-fill"></i>
                  Iniciar Jogo
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
