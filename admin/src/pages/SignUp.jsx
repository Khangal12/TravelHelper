import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import useApi from "../hook/useApi";

const { Title } = Typography;

const SignUp = () => {
  const { user } = useApi();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const data = await user.user.signup(values); // Assume there's a signup API
      if (data.user) {
        message.success("Амжилттай бүргүүллээ");
        navigate("/login");
      } else {
        message.error(data || "!");
      }
    } catch (error) {
      const msg =
    error?.response?.data?.message || // single
    error?.response?.data?.messages?.join(" ") || // multiple
    "Signup failed!";
  message.error(msg);
    }
    finally {
      setLoading(false);
    }
   
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ maxWidth: "400px", width: "100%", padding: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}>
        <Title level={2} style={{ textAlign: "center" }}>Бүртгүүлэх</Title>
        <Form name="signup" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical">
          
          <Form.Item name="email" label="Имэйл" rules={[
            { required: true, message: "Имэйл хаягаа оруулна уу!" },
            { type: "email", message: "Зөв имэйл хаяг оруулна уу!" }
          ]}>
            <Input prefix={<MailOutlined />} placeholder="Имэйл хаяг" size="large" />
          </Form.Item>

          <Form.Item name="username" label="Хэрэглэгчийн нэр" rules={[{ required: true, message: "Хэрэглэгчийн нэрээ оруулна уу!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Хэрэглэгчийн нэр" size="large" />
          </Form.Item>

          <Form.Item name="firstName" label="Нэр" rules={[{ required: true, message: "Нэрээ оруулна уу!" }]}>
            <Input placeholder="Нэр" size="large" />
          </Form.Item>

          <Form.Item name="lastName" label="Овог" rules={[{ required: true, message: "Овгоо оруулна уу!" }]}>
            <Input placeholder="Овог" size="large" />
          </Form.Item>

          <Form.Item name="password" label="Нууц үг" rules={[{ required: true, message: "Нууц үгээ оруулна уу!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Нууц үг" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Нууц үг давтах"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Нууц үгээ давтан оруулна уу!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Нууц үг таарахгүй байна!"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Нууц үг дахин оруулах" size="large" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size="large"
            >
              Бүртгүүлэх
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: "center" }}>
            <Link to="/login">Бүртгэлтэй юу? Нэвтрэх</Link>
          </Form.Item>

        </Form>
      </div>
    </div>
  );
};

export default SignUp;
