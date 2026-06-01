import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { InicioPage } from './pages/InicioPage';
import { JogoPage } from './pages/JogoPage';
import { RankingPage } from './pages/RankingPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100 radial-bg">
        <Navbar />

        <main className="flex-grow-1 d-flex align-items-start justify-content-center pt-3 pb-5 mt-5">
          <Routes>
            <Route path="/" element={<InicioPage />} />
            <Route path="/jogo" element={<JogoPage />} />
            <Route path="/ranking" element={<RankingPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
