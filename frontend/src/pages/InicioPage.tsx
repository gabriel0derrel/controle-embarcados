import { useNavigate } from 'react-router-dom';
import { InicioScreen } from '../components/InicioScreen';

export function InicioPage() {
  const navigate = useNavigate();

  return <InicioScreen onStartGame={() => navigate('/jogo')} />;
}
