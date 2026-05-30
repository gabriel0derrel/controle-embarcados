

interface CardProps {
  title: string;
  content: string;
  footer?: string;
}

export const Card = ({ title, content, footer }: CardProps) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{content}</p>
        {footer && <small className="text-muted">{footer}</small>}
      </div>
    </div>
  );
};