interface InputProps {
    id?: string;
    label: string;
    visible?: "none" | "true" | "false";
    type: 'text' | 'number' | 'email' | 'password' | 'date'
    value: string;  
    placeholder?: string;
    disabled?: boolean;
    error?: string; // Nova prop
    onChange: (value: string) => void;
}

export const Input = ({ id, label, visible = "none", type, value, placeholder = '', disabled = false, error, onChange }: InputProps) => {
    return (
        <>
            <div className="d-grid">
                { visible === "true" ? <label htmlFor={id} className="form-label" >{label}</label> : null }
                <input 
                    id={id}
                    type={type} 
                    className={`form-control mb-1 ${error ? 'is-invalid' : ''}`}
                    value={value} 
                    placeholder={placeholder} 
                    disabled={disabled} 
                    onChange={(e) => onChange(e.target.value)} 
                />
                {error && <div className="invalid-feedback d-block mb-2">{error}</div>}
            </div>
        </>
    );
};