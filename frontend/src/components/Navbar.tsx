import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Início' },
  { path: '/jogo', label: 'Jogo' },
  { path: '/ranking', label: 'Ranking' },
];

export function Navbar() {
  return (
    <nav className="navbar navbar-expand-md bg-white fixed-top shadow-sm border-bottom">
      <div className="container">
        <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2">
          <div className="d-flex gap-1">
            <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#28a745' }}></span>
            <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#dc3545' }}></span>
            <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#ffc107' }}></span>
            <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#007bff' }}></span>
          </div>
          <span className="text-dark" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, fontSize: '1.1rem' }}>Genius</span>
        </NavLink>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-1">
            {navItems.map(({ path, label }) => (
              <li className="nav-item" key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) =>
                    `nav-link rounded-pill px-3 ${
                      isActive ? 'active fw-semibold text-dark bg-light' : 'text-secondary'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
