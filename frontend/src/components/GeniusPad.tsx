import { useState, useCallback } from 'react';
import type { CorGenius } from '../types/jogo';

interface GeniusPadProps {
  onColorPress: (cor: CorGenius) => void;
  disabled?: boolean;
}

const CORES: { cor: CorGenius; normal: string; acesa: string }[] = [
  { cor: 'verde', normal: '#28a745', acesa: '#5eff82' },
  { cor: 'vermelho', normal: '#dc3545', acesa: '#ff6b7a' },
  { cor: 'amarelo', normal: '#ffc107', acesa: '#ffe066' },
  { cor: 'azul', normal: '#007bff', acesa: '#66b3ff' },
];

export function GeniusPad({ onColorPress, disabled }: GeniusPadProps) {
  const [clicked, setClicked] = useState<CorGenius | null>(null);

  const handleClick = useCallback((cor: CorGenius) => {
    if (disabled) return;
    setClicked(cor);
    onColorPress(cor);
    setTimeout(() => setClicked(null), 300);
  }, [disabled, onColorPress]);

  return (
    <div className="mx-auto" style={{ maxWidth: '300px' }}>
      <div className="row g-2">
        {CORES.map(({ cor, normal, acesa }) => {
          const isAcesa = clicked === cor;
          return (
            <div key={cor} className="col-6">
              <button
                className="btn w-100 rounded-3 border border-2 border-dark"
                style={{
                  aspectRatio: '1',
                  backgroundColor: isAcesa ? acesa : normal,
                  opacity: isAcesa ? 1 : 0.7,
                  boxShadow: isAcesa ? `0 0 30px 10px ${acesa}` : 'none',
                  transition: 'all 0.15s ease',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                onClick={() => handleClick(cor)}
                disabled={disabled}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
