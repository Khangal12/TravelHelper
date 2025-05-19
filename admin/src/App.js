import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Trip from "./pages/Trip";
import Users from "./pages/Users";
import Booking from "./pages/Booking";
import TripProgram from "./pages/TripProgram";
import TripDetail from "./pages/TripDetail";
import CustomLayout from "./CustomLayout";
import CampBuild from "./pages/CampBuild";
import CampAdd from "./pages/CampAdd";
import PlaceBuild from "./pages/PlaceBuild";
import PlaceAdd from "./pages/PlaceAdd";
import CampDetails from "./pages/CampDetails";
import PlaceDetail from "./pages/PlaceDetail";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TripDetailsPage from "./pages/TripMoreDetail";
import AdminPermissionPanel from "./pages/Admission";
import usePermissions from "./hook/usePermissions";
import "@ant-design/v5-patch-for-react-19";
import BookingDetail from "./pages/BookingDetail";
import ChatBotUI from "./components/chatbot/ChatBotUI";

const ProtectedRoutes = () => {
  const { hasPermission, loading,isSuperuser, isUser,isStaff } = usePermissions();

  if (loading) return <div>Loading permissions...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />

      {/* Protected Routes inside CustomLayout */}
      <Route element={<CustomLayout />}>
      {
        (isSuperuser || isUser) && <Route index element={<Trip />} />
      }
        <Route path="/trip/:id" element={<TripDetail />} />
        <Route path="/detail/trip/:id" element={<TripDetailsPage />} />

        {/* Admin Only */}
        {isSuperuser && <Route path="/auth" element={<AdminPermissionPanel />} />}

        {/* Corp Permission */}
        {(isSuperuser || isUser) && <Route path="/trip/new" element={<TripProgram />} />}

        {/* Booking */}
        {
        (isSuperuser || isUser) && <>
          <Route path="/bookings" element={<Booking />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          </>
        }

        {/* Places */}
        <Route path="/places" element={<PlaceBuild />} />
        <Route path="/places/:id" element={<PlaceDetail />} />
        {isStaff && <Route path="/places/new" element={<PlaceAdd />} />}

        {/* Camps */}
        <Route path="/camps" element={<CampBuild />} />
        {isStaff && <Route path="/camps/new" element={<CampAdd />} />}
        <Route path="/camps/:id" element={<CampDetails />} />
        <Route path="/chatbot" element={<ChatBotUI />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <ProtectedRoutes />
    </Router>
  );
};

export default App;
