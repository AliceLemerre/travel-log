import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home-page/HomePage";
import PrivateRoute from "./components/private-route/PrivateRoute";
import ListVoyagePage from "./pages/voyages/list-voyages/ListVoyages";
import FormVoyagePage from "./pages/voyages/form-voyages/FormVoyages";
import Auth from "./components/auth/Auth";
import InfoVoyagePage from "./pages/voyages/info-voyages/InfoVoyages";
import EtapeFormPage from "./pages/etapes/form-etapes/EtapeFormPage";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import InfoEtapesPage from "./pages/etapes/info-etapes/InfoEtapes";

function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/voyages"
          element={
            <PrivateRoute>
              <ListVoyagePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/voyages/new"
          element={
            <PrivateRoute>
              <FormVoyagePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/voyages/:id"
          element={
            <PrivateRoute>
              <InfoVoyagePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/voyages/:id/edit"
          element={
            <PrivateRoute>
              <FormVoyagePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/voyages/:voyageId/etapes/new"
          element={
            <PrivateRoute>
              <EtapeFormPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/voyages/:voyageId/etapes/:etapeId"
          element={
            <PrivateRoute>
              <InfoEtapesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/voyages/:voyageId/etapes/:etapeId/edit"
          element={
            <PrivateRoute>
              <EtapeFormPage />
            </PrivateRoute>
          }
        />

        {/* <Route path="/404" element={<NotFoundPage />} /> */}
        
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
