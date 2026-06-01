import React from 'react';

interface InicioScreenProps {
  onStartGame: () => void;
}

export const InicioScreen: React.FC<InicioScreenProps> = ({ onStartGame }) => {
  return (
    <div className="container py-3">
      <div className="row align-items-center justify-content-center g-5 mt-2">

        {/* Conteúdo Esquerdo / Preview do Jogo */}
        <div className="col-12 col-lg-6 text-center text-lg-start">
          <h1 className="display-4 fw-bold mb-3 text-dark">
            Desafie sua Memória
          </h1>
          <p className="lead text-secondary mb-4 mx-auto mx-lg-0" style={{ maxWidth: '500px' }}>
            Conecte-se a dispositivos físicos reais ou use nosso simulador para testar seus reflexos no clássico jogo Genius, agora potencializado com a tecnologia IoT.
          </p>

          {/* Grid de Preview dos Botões do Genius */}
          <div
            className="position-relative mx-auto ms-lg-0"
            style={{
              width: '240px',
              height: '240px',
              borderRadius: '16px',
              backgroundColor: '#edeeef',
              padding: '12px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              border: '1px solid #dee2e6'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '10px',
                width: '100%',
                height: '100%'
              }}
            >
              <div
                className="bg-success opacity-75"
                style={{
                  borderRadius: '8px'
                }}
              ></div>
              <div
                className="bg-danger opacity-75"
                style={{
                  borderRadius: '8px'
                }}
              ></div>
              <div
                className="bg-warning opacity-75"
                style={{
                  borderRadius: '8px'
                }}
              ></div>
              <div
                className="bg-primary opacity-75"
                style={{
                  borderRadius: '8px'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Conteúdo Direito / Painel de Controle */}
        <div className="col-12 col-md-8 col-lg-5 col-xl-4">
          <div className="card shadow-lg border border-light rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5 text-center">
              <h2 className="h3 fw-bold text-dark mb-4">Pronto para Começar?</h2>

              <div className="d-grid">
                <button
                  onClick={onStartGame}
                  className="btn btn-primary fw-bold d-flex align-items-center justify-content-center gap-2 border-0 shadow-sm"
                  style={{
                    backgroundColor: '#007bff',
                    borderRadius: '4px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    fontSize: '0.95rem'
                  }}
                >
                  <i className="bi bi-play-fill fs-5"></i>
                  INICIAR JOGO
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
