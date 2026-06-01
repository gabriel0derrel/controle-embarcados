import type { CorGenius } from '../types/jogo';

interface GeniusPadProps {
  onColorPress: (cor: CorGenius) => void;
  disabled?: boolean;
  entrada?: string[];
}

const CORES: { cor: CorGenius; bg: string; bgLit: string }[] = [
  { cor: 'verde', bg: 'bg-success', bgLit: 'bg-success' },
  { cor: 'vermelho', bg: 'bg-danger', bgLit: 'bg-danger' },
  { cor: 'amarelo', bg: 'bg-warning', bgLit: 'bg-warning' },
  { cor: 'azul', bg: 'bg-primary', bgLit: 'bg-primary' },
];

export function GeniusPad({ onColorPress, disabled, entrada = [] }: GeniusPadProps) {
  return (
    <div className="mx-auto" style={{ maxWidth: '300px' }}>
      <div className="row g-2">
        {CORES.map(({ cor, bg }) => (
          <div key={cor} className="col-6">
            <button
              className={`btn ${bg} w-100 rounded-3 border border-2 border-dark ${entrada.includes(cor) ? 'opacity-100' : 'opacity-75'}`}
              style={{ aspectRatio: '1', filter: entrada.includes(cor) ? 'brightness(1.3)' : 'none' }}
              onClick={() => onColorPress(cor)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
