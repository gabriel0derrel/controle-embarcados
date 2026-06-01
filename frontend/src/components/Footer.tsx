import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-3 mt-auto border-top">
      <div className="container d-flex justify-content-between align-items-center">
        <small className="text-secondary">Genius v1.0</small>
        <div className="d-flex align-items-center gap-2">
          <span className="rounded-circle bg-success pulse-green" style={{ width: '6px', height: '6px' }}></span>
          <small className="text-success fw-medium">MQTT Conectado</small>
        </div>
      </div>
    </footer>
  );
};
