import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import useApi from "../hook/useApi";
const { Title } = Typography;

const Login = () => {
  const {user} = useApi()
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const data = await user.user.login(values);
    if (data.token) {
      message.success("Login successful!");
      localStorage.setItem("token", data.token); // Fix: save the correct token
      navigate("/");
    } else {
      message.error(data.error || "Login failed!");
    }
    setLoading(false);
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
