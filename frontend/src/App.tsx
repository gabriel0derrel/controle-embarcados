import { useState } from "react"
import { Nav } from "./components/Nav"
import { AppRouter } from "./routers/app.routers"

function App() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="container-fluid px-0 min-vh-100">
      <div className="row g-0 min-vh-100 flex-column flex-md-row">
        {!collapsed && (
          <aside className="col-12 col-md-auto bg-dark text-white p-3">
            <Nav collapsed={collapsed} onToggle={() => setCollapsed(true)} />
          </aside>
        )}

        <main className="col bg-light p-3 overflow-auto">
          {collapsed && (
            <div className="d-flex justify-content-start mb-3">
              <button
                type="button"
                className="btn btn-dark btn-sm"
                onClick={() => setCollapsed(false)}
                aria-label="Expandir navegação"
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          )}
          <AppRouter />
        </main>
      </div>
    </div>
  );
}

export default App
