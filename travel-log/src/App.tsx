import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home-page/HomePage";
// import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage";
// import VoyagesListPage from "./pages/VoyagesListPage";
// import VoyageDetailPage from "./pages/VoyageDetailPage";
// import VoyageCreatePage from "./pages/VoyageCreatePage";
// import VoyageEditPage from "./pages/VoyageEditPage";
// import TagsPage from "./pages/TagsPage";
// import ProfilePage from "./pages/ProfilePage";
// import NotFoundPage from "./pages/NotFoundPage";
// import PrivateRoute from "./components/private-route/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        
        <Route path="/voyages" element={
          <PrivateRoute>
            <VoyagesListPage />
          </PrivateRoute>
        } />
        
        <Route path="/voyages/:id" element={
          <PrivateRoute>
            <VoyageDetailPage />
          </PrivateRoute>
        } />
        
        <Route path="/voyages/new" element={
          <PrivateRoute>
            <VoyageCreatePage />
          </PrivateRoute>
        } />
        
        <Route path="/voyages/:id/edit" element={
          <PrivateRoute>
            <VoyageEditPage />
          </PrivateRoute>
        } />
        
        <Route path="/tags" element={
          <PrivateRoute>
            <TagsPage />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } /> */}
        
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;