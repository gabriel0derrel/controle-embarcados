import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RankingEntry {
  id: number;
  apelido: string;
  fase: number;
}

export function RankingPage() {
  const navigate = useNavigate();
  const [apelido, setApelido] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const faseFinal = 5; // TODO: receber do jogo

  const carregarRanking = async () => {
    try {
      const res = await fetch('/api/ranking');
      const data = await res.json();
      setRanking(data);
    } catch (e) {
      console.error('Erro ao carregar ranking:', e);
    }
  };

  useEffect(() => {
    carregarRanking();
  }, []);

  const handleSalvar = async () => {
    if (apelido.length !== 3) return;
    setSalvando(true);
    try {
      await fetch('/api/ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apelido, fase: faseFinal }),
      });
      setSalvo(true);
      carregarRanking();
    } catch (e) {
      console.error('Erro ao salvar ranking:', e);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5 text-center">

          {/* Header */}
          <div className="mb-4">
            <div className="text-secondary small text-uppercase mb-2">Fim de Jogo</div>
            <div className="display-1 fw-bold" style={{ color: '#ffd966' }}>{faseFinal}ª</div>
            <div className="text-secondary">Fase alcançada</div>
          </div>

          {/* Card */}
          <div className="card border-0 shadow-sm rounded-4 text-start overflow-hidden">
            <div className="card-body p-4 p-md-5 d-flex flex-column">

              {/* Input do apelido */}
              {!salvo ? (
                <>
                  <div className="mb-4">
                    <label className="form-label text-secondary small fw-bold text-uppercase mb-2">
                      Apelido (3 letras)
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg text-center fs-3 fw-bold text-uppercase border"
                      placeholder="AAA"
                      maxLength={3}
                      value={apelido}
                      onChange={(e) => setApelido(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))}
                      disabled={salvando}
                      style={{ letterSpacing: '0.5em' }}
                    />
                  </div>
                  <div className="d-grid gap-2 mb-4">
                    <button
                      className="btn btn-primary fw-semibold d-flex align-items-center justify-content-center gap-2 opacity-50"
                      onClick={handleSalvar}
                      disabled={apelido.length !== 3 || salvando}
                      style={{ cursor: apelido.length !== 3 ? 'not-allowed' : 'pointer' }}
                    >
                      {salvando ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status"></span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          Salvar e Ver Ranking
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="d-grid gap-2 mb-4">
                  <button
                    className="btn btn-success fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled
                  >
                    <i className="bi bi-check-circle"></i>
                    Salvo!
                  </button>
                </div>
              )}

              {/* Ranking */}
              {ranking.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <h2 className="fs-5 mb-0 fw-bold text-dark">Ranking Global</h2>
                  </div>
                  <div className="table-responsive border rounded-3">
                    <table className="table table-hover table-borderless mb-0 align-middle">
                      <thead className="bg-light border-bottom">
                        <tr>
                          <th className="text-center text-secondary small text-uppercase py-3" style={{ width: '60px' }}>Pos</th>
                          <th className="text-secondary small text-uppercase py-3">Apelido</th>
                          <th className="text-end text-secondary small text-uppercase py-3 pe-4">Fase</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.map((entry, index) => (
                          <tr key={entry.id} className="border-bottom">
                            <td className="text-center fw-bold">
                              <span className={`badge rounded-pill ${index === 0 ? 'bg-warning text-dark' : 'bg-light text-dark'} px-2 py-1`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="fw-bold text-dark" style={{ letterSpacing: '0.2em' }}>
                              {entry.apelido}
                            </td>
                            <td className="text-end fw-bold fs-5 pe-4 text-dark">
                              {entry.fase}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Voltar - colado no final */}
              <div className="mt-auto pt-4">
                <button
                  className="btn btn-link text-decoration-none fw-semibold d-flex align-items-center justify-content-center gap-2 mx-auto"
                  onClick={() => navigate('/')}
                >
                  <i className="bi bi-arrow-left"></i>
                  Voltar ao Início
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
