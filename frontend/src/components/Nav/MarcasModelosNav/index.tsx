import { NavLink } from "react-router-dom";

const items = [
  { to: "/marcas-modelos/marcas", label: "Marcas" },
  { to: "/marcas-modelos/modelos", label: "Modelos" },
];

export const MarcasModelosNav = () => {
  return (
    <ul className="nav nav-pills justify-content-center gap-2 border-bottom mb-3 pb-2">
        {items.map((item) => (
          <li className="nav-item" key={item.to}>
            <NavLink
              className={({ isActive }) =>
                `nav-link px-3 py-1 ${isActive ? "active" : "text-secondary"}`
              }
              to={item.to}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
    </ul>
  );
};
