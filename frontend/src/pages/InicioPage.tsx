import { useNavigate } from 'react-router-dom';

export function InicioPage() {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <div className="row align-items-center g-4 g-lg-5 mt-2">

        {/* Coluna Esquerda - Texto */}
        <div className="col-12 col-lg-6 text-center text-lg-start">
          <h1 className="display-2 mb-3" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}>
            <span style={{ color: '#28a745' }}>G</span>
            <span style={{ color: '#dc3545' }}>e</span>
            <span style={{ color: '#ffc107' }}>n</span>
            <span style={{ color: '#007bff' }}>i</span>
            <span style={{ color: '#28a745' }}>u</span>
            <span style={{ color: '#dc3545' }}>s</span>
          </h1>

          <p className="fs-5 text-secondary mb-4 mx-auto mx-lg-0" style={{ maxWidth: '460px' }}>
            Controle dispositivos embarcados remotamente. Jogue contra o hardware físico via MQTT em tempo real.
          </p>
        </div>

        {/* Coluna Direita - Card */}
        <div className="col-12 col-sm-10 col-md-8 col-lg-5 mx-auto ms-lg-auto">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-3 p-md-4">
              {/* Status */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="rounded-circle bg-success" style={{ width: '8px', height: '8px' }}></span>
                <small className="text-secondary fw-medium">Dispositivo Conectado</small>
              </div>

              {/* Grid Genius */}
              <div className="mx-auto mb-3" style={{ maxWidth: '220px', aspectRatio: '1' }}>
                <div className="row g-2 h-100">
                  <div className="col-6">
                    <div className="bg-success rounded-3 opacity-75 h-100 border border-2 border-dark"></div>
                  </div>
                  <div className="col-6">
                    <div className="bg-danger rounded-3 opacity-75 h-100 border border-2 border-dark"></div>
                  </div>
                  <div className="col-6">
                    <div className="bg-warning rounded-3 opacity-75 h-100 border border-2 border-dark"></div>
                  </div>
                  <div className="col-6">
                    <div className="bg-primary rounded-3 opacity-75 h-100 border border-2 border-dark"></div>
                  </div>
                </div>
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
                  onClick={() => navigate('/jogo')}
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
}
