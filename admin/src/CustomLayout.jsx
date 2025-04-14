import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  HomeOutlined,
  ContactsOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import usePermissions from "./hook/usePermissions";

const { Header, Sider, Content } = Layout;

const CustomLayout = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const { hasPermission, loadings, isSuperuser, isUser, isStaff } = usePermissions();


  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    setLoading(false);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loadings) return <div>Loading navbar...</div>;


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
      >
        <div
          className="logo"
          style={{
            color: "white",
            textAlign: "center",
            padding: "16px",
            fontSize: "18px",
          }}
        >
          Travel Helper
        </div>
        <Menu theme="dark" mode="inline">

          {(isSuperuser || isUser) && (
            <Menu.Item
              key="1"
              icon={<DashboardOutlined />}
              onClick={() => handleMenuClick("/")}
            >
              Аялал
            </Menu.Item>
          )
          }
          {(isSuperuser || isUser) && (
            <Menu.Item key="2" icon={<CrownOutlined />} onClick={() => handleMenuClick("/trip/new")}>
              Аялалын программ зохиох
            </Menu.Item>
          )}
          <Menu.Item key="3" icon={<ContactsOutlined />} onClick={() => handleMenuClick("/places")}>
            Үзэх газрууд
          </Menu.Item>
          <Menu.Item
            key="4"
            icon={<HomeOutlined />}
            onClick={() => handleMenuClick("/camps")}
          >
            Амралтын газрууд
          </Menu.Item>
          {(hasPermission("admin") || isUser) && (
            <Menu.Item
              key="6"
              icon={<FileTextOutlined />}
              onClick={() => handleMenuClick("/bookings")}
            >
              Захиалга
            </Menu.Item>)}
          {isSuperuser && (
            <Menu.Item key="8" icon={<FileTextOutlined />} onClick={() => handleMenuClick("/auth")}>
              Эрх
            </Menu.Item>
          )}
          <Menu.Item key="7" icon={<LogoutOutlined />} onClick={handleLogout}>
            Гарах
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 0, textAlign: "center" }}>
          {isSuperuser && 'Админ'} {isUser && 'Хэрэглэгч'} {isStaff && 'Байгууллага'} website
        </Header>
        <Content style={{ margin: "16px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;
