import { Routes, Route } from "react-router-dom";
import LandingPage from "./Landing/pages/LandingPage.jsx";
import SearchResultsPage from "./Search/pages/SearchResultsPage.jsx";

import HotelDetailPage from "./Landing/pages/HotelDetailPage.jsx";
import CheckoutPage from "./Auth/pages/CheckoutPage.jsx";
import LoginPage from "./Auth/pages/LoginPage.jsx";
import RegisterPage from "./Auth/pages/RegisterPage.jsx";
import ProfilePage from "./Auth/pages/ProfilePage.jsx";
import GeniusPage from "./Auth/pages/GeniusPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<SearchResultsPage />} />

      <Route path="/hotel/:id" element={<HotelDetailPage />} />
      <Route path="/checkout/:id" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/genius" element={<GeniusPage />} />
    </Routes>
  );
}
