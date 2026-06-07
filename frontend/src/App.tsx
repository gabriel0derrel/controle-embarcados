import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { MqttProvider } from './hooks/useMqtt';

function App() {
  return (
    <MqttProvider>
      <RouterProvider router={router} />
    </MqttProvider>
  );
}

export default App;
