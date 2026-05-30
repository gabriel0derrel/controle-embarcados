import { Navigate, Route, Routes } from "react-router-dom"
import { HomePages } from "../pages/HomePages"
import { SobrePages } from "../pages/SobrePages"
import { UsuarioPages } from "../pages/UsuarioPages"
import { MarcasModelosPages } from "../pages/MarcasModelosPages"
import { PlacasEmbarcadasPages } from "../pages/PlacasEmbarcadasPages"
import { SensoresPages } from "../pages/SensoresPages"
import { AtuadoresPages } from "../pages/AtuadoresPages"
import { ServidorMqttPages } from "../pages/ServidorMqttPages"


export const AppRouter = () => {
  return (
    <>
        <Routes>
            <Route path="/" element={<HomePages />} />
            <Route path="/sobre" element={<SobrePages />} />
            <Route path="/usuario" element={<UsuarioPages />} />
            <Route path="/marcas-modelos" element={<Navigate to="/marcas-modelos/marcas" replace />} />
            <Route path="/marcas-modelos/*" element={<MarcasModelosPages />} />
            <Route path="/placas-embarcadas" element={<PlacasEmbarcadasPages />} />
            <Route path="/sensores" element={<SensoresPages />} />
            <Route path="/atuadores" element={<AtuadoresPages />} />
            <Route path="/servidor-mqtt" element={<ServidorMqttPages />} />
        </Routes>
    </>
    )
}
