

interface ButtonProps {
    value: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    onClick: () => void;
    disabled?: boolean;
}
export const Button = (
    { value, type = 'button', variant = 'primary', onClick, disabled = false }: ButtonProps
) => {
    return (
        <>
            <div className="d-grid">
                <button
                    type={type}
                    className={`btn btn-${variant}`}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {value}
                </button>
            </div>
        </>
    );
};