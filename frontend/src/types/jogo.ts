export type CorGenius = 'vermelho' | 'amarelo' | 'verde' | 'azul';

export interface EstadoJogo {
  tela: 'inicio' | 'piscando' | 'aguardando' | 'certo' | 'errado';
  fase: number;
  seq_len: number;
  entrada: string[];
}
