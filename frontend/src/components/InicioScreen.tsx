import React from 'react';

export const InicioScreen: React.FC = () => {
  return (
    <div className="container py-5">
      <div className="row align-items-center justify-content-center g-5">
        
        {/* Conteúdo Esquerdo / Preview do Jogo */}
        <div className="col-12 col-lg-6 text-center text-lg-start">
          <h1 className="display-4 fw-bold mb-3 text-dark">
            Controle Remoto Genius
          </h1>
          <p className="lead text-secondary mb-4 mx-auto mx-lg-0" style={{ maxWidth: '500px' }}>
            Dispositivo Pré-estabelecido: <strong>ESP32 Genius IoT</strong>
          </p>
          
          {/* Grid de Preview dos Botões do Genius */}
          <div 
            className="position-relative mx-auto ms-lg-0" 
            style={{ 
              width: '240px', 
              height: '240px', 
              borderRadius: '50%', 
              backgroundColor: '#edeeef',
              padding: '10px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              border: '1px solid #dee2e6'
            }}
          >
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gridTemplateRows: '1fr 1fr', 
                gap: '8px', 
                width: '100%', 
                height: '100%' 
              }}
            >
              <div 
                className="bg-success opacity-75"
                style={{ 
                  borderTopLeftRadius: '100%', 
                  borderTopRightRadius: '0.75rem',
                  borderBottomLeftRadius: '0.75rem',
                  borderBottomRightRadius: '0.125rem'
                }}
              ></div>
              <div 
                className="bg-danger opacity-75"
                style={{ 
                  borderTopRightRadius: '100%', 
                  borderTopLeftRadius: '0.75rem',
                  borderBottomRightRadius: '0.75rem',
                  borderBottomLeftRadius: '0.125rem'
                }}
              ></div>
              <div 
                className="bg-warning opacity-75"
                style={{ 
                  borderBottomLeftRadius: '100%', 
                  borderBottomRightRadius: '0.75rem',
                  borderTopLeftRadius: '0.75rem',
                  borderTopRightRadius: '0.125rem'
                }}
              ></div>
              <div 
                className="bg-primary opacity-75"
                style={{ 
                  borderBottomRightRadius: '100%', 
                  borderBottomLeftRadius: '0.75rem',
                  borderTopRightRadius: '0.75rem',
                  borderTopLeftRadius: '0.125rem'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Conteúdo Direito / Painel de Controle */}
        <div className="col-12 col-md-8 col-lg-5 col-xl-4">
          <div className="card shadow-lg border border-light rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5 text-center">
              <h2 className="h3 fw-bold text-dark mb-3">Painel de Início</h2>
              <p className="text-secondary small mb-4">Pressione para começar a partida no dispositivo.</p>
              
              <div className="d-grid">
                <button className="btn btn-primary btn-lg py-3 fw-bold border-0 shadow-sm" style={{ backgroundColor: '#007bff' }}>
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
