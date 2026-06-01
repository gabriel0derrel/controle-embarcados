import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { InicioScreen } from './components/InicioScreen';
import './App.css';

function App() {
  const [activeScreen, setActiveScreen] = useState<'inicio' | 'jogo' | 'resultado'>('inicio');

  return (
    <div className="d-flex flex-column min-vh-100 radial-bg">
      <Navbar 
        activeScreen={activeScreen} 
        onNavigate={setActiveScreen} 
      />

      {/* Área de Conteúdo Principal */}
      <main className="flex-grow-1 d-flex align-items-start justify-content-center pt-3 pb-5 mt-5">
        {activeScreen === 'inicio' && (
          <InicioScreen onStartGame={() => setActiveScreen('jogo')} />
        )}

        {activeScreen === 'jogo' && (
          <div className="container py-5 text-center card shadow-lg p-5 rounded-4 bg-white" style={{ maxWidth: '480px' }}>
            <h2 className="text-dark fw-bold mb-3">Tela de Jogo</h2>
            <p className="text-secondary mb-0">Esta tela será implementada no próximo passo.</p>
          </div>
        )}

        {activeScreen === 'resultado' && (
          <div className="container py-5 text-center card shadow-lg p-5 rounded-4 bg-white" style={{ maxWidth: '480px' }}>
            <h2 className="text-dark fw-bold mb-3">Tela de Ranking</h2>
            <p className="text-secondary mb-0">Esta tela será implementada nos passos subsequentes.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
