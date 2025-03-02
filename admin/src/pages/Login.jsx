import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios"; // Import axios for making API requests

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Make the API request to your backend login endpoint
      const response = await axios.post(
        "http://localhost:8001/api/admin/login/",
        {
          username: values.username,
          password: values.password,
        }
      );

      // Check if the response contains a token or session
      if (response.status === 200 && response.data.token) {
        message.success("Login successful!");

        // Save the token to localStorage or use it as needed
        localStorage.setItem("token", response.data.token);

        // Redirect to home/dashboard after login
        setTimeout(() => {
          // Redirect after authentication is completed
          navigate("/");
        }, 500); // Adjust timing as needed
      }
    } catch (error) {
      message.error("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <Title level={2}>Login</Title>
      <Form name="login" initialValues={{ remember: true }} onFinish={onFinish}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your Username!" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Username"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
          >
            Log In
          </Button>
        </Form.Item>

        <Form.Item>
          <a href="/forgot-password">Forgot password?</a>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
