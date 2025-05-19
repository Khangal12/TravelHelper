import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, FloatButton } from "antd";
import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  HomeOutlined,
  ContactsOutlined,
  CrownOutlined,
  MessageOutlined
} from "@ant-design/icons";
import usePermissions from "./hook/usePermissions";
import ChatBotUI from "./components/chatbot/ChatBotUI";

const { Header, Sider, Content } = Layout;

const CustomLayout = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
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

         {/* Floating Chatbot Button */}
         <FloatButton
          icon={<MessageOutlined />}
          type="primary"
          style={{ right: 24, bottom: 24 }}
          onClick={() => setShowChatbot(!showChatbot)}
        />
        
        {showChatbot && (
          <div style={{
            position: 'fixed',
            right: 24,
            bottom: 80,
            width: 350,
            height: 500,
            backgroundColor: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRadius: 8,
            zIndex: 1000,
          }}>
            {/* Replace with your actual Chatbot component */}
            <div>
             <ChatBotUI/>
            </div>
          </div>
        )}
      </Layout>
    </Layout>
  );
};

export default CustomLayout;
