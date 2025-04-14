import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../hook/useApi";

const { Title } = Typography;

const ResetPassword = () => {
  const { userId, token } = useParams();
  const { user } = useApi();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    const response = await user.user.resetPassword(userId, token, values.password, values.confirmPassword);

    if (response.success) {
      message.success("Password reset successful! You can now log in.");
      navigate("/login");
    } else {
      message.error(response.error || "Failed to reset password.");
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ maxWidth: "400px", width: "100%", padding: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}>
        <Title level={2} style={{ textAlign: "center" }}>Шинэ нууц үг</Title>
        <Form name="reset-password" onFinish={onFinish}>
          <Form.Item name="password" rules={[{ required: true, message: "Please enter your new password!" }]}>
            <Input.Password placeholder="Шинэ нууц үг" size="large" />
          </Form.Item>

          <Form.Item name="confirmPassword" rules={[{ required: true, message: "Please confirm your password!" }]}>
            <Input.Password placeholder="Нууц үг давтах" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              Хадгалах
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
