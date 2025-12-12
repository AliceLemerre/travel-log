import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/home-page/HomePage";
import PrivateRoute from "./components/private-route/PrivateRoute";

import ListVoyagePage from "./pages/voyages/list-voyages/ListVoyages";
import FormVoyagePage from "./pages/voyages/form-voyages/FormVoyages";
import Auth from "./components/auth/Auth";


function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Auth />} />

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
          path="/voyages/:id/edit"
          element={
            <PrivateRoute>
              <FormVoyagePage />
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
