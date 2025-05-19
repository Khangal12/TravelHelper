import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import useApi from "../hook/useApi";

const { Title } = Typography;

const Login = () => {
  const { user } = useApi();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await user.user.login(values);
      if (data.token) {
        message.success("Login successful!");
        localStorage.setItem("token", data.token);
        if (data.staff) {
          navigate("/places");
        } else {
          navigate("/");
        }
      } else {
        message.error(data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Login failed:", error); // just for dev logs
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ maxWidth: "400px", width: "100%", padding: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}>
        <Title level={2} style={{ textAlign: "center" }}>Нэвтрэх</Title>
        <Form name="login" initialValues={{ remember: true }} onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: "Please input your Username!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Хэрэглэгчийн нэр" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Please input your Password!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Нууц үг" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              Нэвтрэх
            </Button>
          </Form.Item>
          <Form.Item>
            <Button style={{
              backgroundColor: "rgb(4, 21, 40)",
              borderColor: "rgb(4, 21, 40)",
              color: "white"
            }} block size="large"  onClick={() => navigate("/sign-up")}>
              Бүртгүүлэх
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Link to="/forgot-password">Нууц үг мартсан?</Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
