import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMqtt } from '../hooks/useMqtt';

interface RankingEntry {
  id: number;
  apelido: string;
  fase: number;
}

const LAST_GAME_PHASE_KEY = 'genius:lastGamePhase';
const MAX_NOME_LENGTH = 20;

function carregarFaseFinal(locationState: unknown): number | null {
  const faseDaRota = (locationState as { faseFinal?: unknown } | null)?.faseFinal;

  if (typeof faseDaRota === 'number' && Number.isInteger(faseDaRota) && faseDaRota > 0) {
    return faseDaRota;
  }

  const faseArmazenada = Number(localStorage.getItem(LAST_GAME_PHASE_KEY));

  if (Number.isInteger(faseArmazenada) && faseArmazenada > 0) {
    return faseArmazenada;
  }

  return null;
}

export function RankingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enviarJogo, resetarEstadoJogo } = useMqtt();
  const [apelido, setApelido] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const faseFinal = carregarFaseFinal(location.state);
  const nomeValido = apelido.trim().length >= 1 && apelido.trim().length <= MAX_NOME_LENGTH;

  const carregarRanking = async () => {
    try {
      const res = await fetch('/api/ranking');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

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
    if (!nomeValido || !Number.isInteger(faseFinal) || faseFinal < 1) return;
    const fase = faseFinal;

    setSalvando(true);
    try {
      const response = await fetch('/api/ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apelido: apelido.trim(), fase }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      localStorage.removeItem(LAST_GAME_PHASE_KEY);
      resetarEstadoJogo();
      await enviarJogo('reiniciar');
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
            <div className="display-1 fw-bold" style={{ color: '#ffd966' }}>
              {faseFinal ? `${faseFinal}ª` : '-'}
            </div>
            <div className="text-secondary">
              {faseFinal ? 'Fase alcançada' : 'Nenhuma partida finalizada encontrada'}
            </div>
          </div>

          {/* Card */}
          <div className="card border-0 shadow-sm rounded-4 text-start overflow-hidden">
            <div className="card-body p-4 p-md-5 d-flex flex-column">

              {/* Input do apelido */}
              {!salvo ? (
                <>
                  <div className="mb-4">
                    <label className="form-label text-secondary small fw-bold text-uppercase mb-2">
                      Nome (até 20 caracteres)
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg text-center fs-4 fw-bold border"
                      placeholder="Seu nome"
                      maxLength={MAX_NOME_LENGTH}
                      value={apelido}
                      onChange={(e) => setApelido(e.target.value.slice(0, MAX_NOME_LENGTH))}
                      disabled={salvando}
                    />
                  </div>
                  <div className="d-grid gap-2 mb-4">
                    <button
                      className="btn btn-primary fw-semibold d-flex align-items-center justify-content-center gap-2 opacity-50"
                      onClick={handleSalvar}
                      disabled={!nomeValido || salvando || !faseFinal}
                      style={{ cursor: !nomeValido || salvando || !faseFinal ? 'not-allowed' : 'pointer' }}
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
                          <th className="text-secondary small text-uppercase py-3">Nome</th>
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
                            <td className="fw-bold text-dark">
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
