import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/home-page/Home-page";
// import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage";
// import VoyagesListPage from "./pages/VoyagesListPage";
// import VoyageDetailPage from "./pages/VoyageDetailPage";
// import VoyageCreatePage from "./pages/VoyageCreatePage";
// import VoyageEditPage from "./pages/VoyageEditPage";
// import TagsPage from "./pages/TagsPage";
// import ProfilePage from "./pages/ProfilePage";
// import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/voyages" element={<VoyagesListPage />} />
        <Route path="/voyages/:id" element={<VoyageDetailPage />} />
        <Route path="/voyages/new" element={<VoyageCreatePage />} />
        <Route path="/voyages/:id/edit" element={<VoyageEditPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/404" element={<NotFoundPage />} /> */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;