import React from 'react';
import { useMqtt } from '../hooks/useMqtt';

export const Footer: React.FC = () => {
  const { connected, backendConnected } = useMqtt();

  return (
    <footer className="bg-white py-3 mt-auto border-top">
      <div className="container d-flex justify-content-between align-items-center">
        <small className="text-secondary">Genius v1.0</small>
        <div className="d-flex align-items-center gap-2">
          <span
            className={`rounded-circle ${connected ? 'bg-success' : backendConnected ? 'bg-warning' : 'bg-secondary'}`}
            style={{ width: '6px', height: '6px' }}
          ></span>
          <small className={`fw-medium ${connected ? 'text-success' : backendConnected ? 'text-warning' : 'text-secondary'}`}>
            {connected ? 'Embarcado Online' : backendConnected ? 'Aguardando ESP32' : 'Conectando'}
          </small>
        </div>
      </div>
    </footer>
  );
};
