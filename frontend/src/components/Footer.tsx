import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer 
      className="bg-dark text-light py-3 mt-auto border-top border-3" 
      style={{ borderColor: 'var(--genius-red)' }}
    >
      <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
        <div className="small text-secondary">
          Genius IoT v1.0
        </div>
        <div className="small text-secondary d-flex align-items-center">
          <span className="d-flex align-items-center gap-2 text-success fw-semibold">
            <span className="d-inline-block rounded-circle bg-success pulse-green" style={{ width: '8px', height: '8px' }}></span>
            IoT Connected: Stable
          </span>
        </div>
      </div>
    </footer>
  );
};
