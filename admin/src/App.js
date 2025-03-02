import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Trip from "./pages/Trip";
import Users from "./pages/Users";
import Booking from "./pages/Booking";
import TripCreate from "./pages/TripCreate";
import TripDetail from "./pages/TripDetail";
import CustomLayout from "./CustomLayout";
import CampBuild from "./pages/CampBuild";
import CampAdd from "./pages/CampAdd";
import PlaceBuild from "./pages/PlaceBuild";
import PlaceAdd from "./pages/PlaceAdd";
import CampDetails from "./pages/CampDetails";
import PlaceDetail from "./pages/PlaceDetail";
import Login from "./pages/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Routes wrapped in CustomLayout */}
        <Route element={<CustomLayout />}>
          <Route index element={<Trip />} /> {/* Default route */}
          <Route path="/trip/:id" element={<TripDetail />} />
          <Route path="/trip/new" element={<TripCreate />} />
          <Route path="/users" element={<Users />} />
          <Route path="/bookings" element={<Booking />} />
          <Route path="/places" element={<PlaceBuild />} />
          <Route path="/places/:id" element={<PlaceDetail />} />
          <Route path="/places/new" element={<PlaceAdd />} />
          <Route path="/camps" element={<CampBuild />} />
          <Route path="/camps/new" element={<CampAdd />} />
          <Route path="/camps/:id" element={<CampDetails />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
