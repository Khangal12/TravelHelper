import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const CustomLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div
          className="logo"
          style={{
            color: "white",
            textAlign: "center",
            padding: "16px",
            fontSize: "18px",
          }}
        >
          Blue Gobi Tours
        </div>
        <Menu theme="dark" mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/">Trip</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<LogoutOutlined />}>
            <Link to="/trip/new">Trip Build</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>
            <Link to="/users">Users</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<FileTextOutlined />}>
            <Link to="/bookings">Bookings</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<LogoutOutlined />}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 0, textAlign: "center" }}>
          Admin Dashboard
        </Header>
        <Content style={{ margin: "16px" }}>{children}</Content>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;
