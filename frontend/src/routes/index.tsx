import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { InicioPage } from '../pages/InicioPage';
import { JogoPage } from '../pages/JogoPage';
import { RankingPage } from '../pages/RankingPage';

function AppLayout() {
  return (
    <div className="d-flex flex-column min-vh-100 radial-bg">
      <Navbar />
      <main className="flex-grow-1 d-flex align-items-start justify-content-center pt-3 pb-5 mt-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <InicioPage /> },
      { path: '/jogo', element: <JogoPage /> },
      { path: '/ranking', element: <RankingPage /> },
    ],
  },
]);
