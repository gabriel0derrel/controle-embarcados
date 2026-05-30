import { Navigate, Route, Routes } from "react-router-dom";
import { MarcasModelosNav } from "../components/Nav/MarcasModelosNav";
import { MarcasPages } from "../pages/MarcasModelosPages/MarcasPages";
import { ModelosPages } from "../pages/MarcasModelosPages/ModelosPages";

export const MarcasModelosRouter = () => {
  return (
    <>
      <MarcasModelosNav />

      <Routes>
        <Route path="marcas" element={<MarcasPages />} />
        <Route path="modelos" element={<ModelosPages />} />
        <Route path="*" element={<Navigate to="marcas" replace />} />
      </Routes>
    </>
  );
};
