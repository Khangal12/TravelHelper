import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Trip from "./pages/Trip";
import Users from "./pages/Users";
import Booking from "./pages/Booking";
import TripCreate from "./pages/TripCreate";
import TripDetail from "./pages/TripDetail";
import CustomLayout from "./CustomLayout";
const App = () => {
  return (
    <Router>
      <CustomLayout>
        <Routes>
          <Route path="/" element={<Trip />} />
          <Route path="/trip/:id" element={<TripDetail />} />
          <Route path="/trip/new" element={<TripCreate />} />
          <Route path="/users" element={<Users />} />
          <Route path="/bookings" element={<Booking />} />
        </Routes>
      </CustomLayout>
    </Router>
  );
};

export default App;
