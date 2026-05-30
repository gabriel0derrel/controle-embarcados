import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: "bi-house-door" },
  { to: "/usuario", label: "Usuario", icon: "bi-people" },
  { to: "/marcas-modelos", label: "Marcas e Modelos", icon: "bi-diagram-3" },
  { to: "/placas-embarcadas", label: "Placas Embarcadas", icon: "bi-cpu" },
  { to: "/sensores", label: "Sensores", icon: "bi-thermometer-half" },
  { to: "/atuadores", label: "Atuadores", icon: "bi-lightning-charge" },
  { to: "/servidor-mqtt", label: "Servidor MQTT", icon: "bi-hdd-network" },
  { to: "/sobre", label: "Sobre", icon: "bi-info-circle" },
];

type NavProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export const Nav = ({ onToggle }: NavProps) => {
  return (
    <div className="d-flex flex-column align-items-start">
      <div className="d-flex align-items-center justify-content-start gap-2 mb-3 w-100">
        <button
          type="button"
          className="btn btn-outline-light btn-sm"
          onClick={onToggle}
          aria-label="Retrair navegação"
        >
          <i className="bi bi-chevron-left" />
        </button>
        <span className="fw-semibold text-nowrap">Menu</span>
      </div>

      <nav className="w-100">
        <ul className="nav flex-column gap-1">
          {navItems.map((item) => (
            <li className="nav-item" key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded ${
                    isActive ? "bg-primary text-white" : "text-white"
                  }`
                }
                to={item.to}
                title={item.label}
              >
                <i className={`bi ${item.icon} fs-5`} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
