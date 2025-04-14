import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import useApi from "../hook/useApi";

const { Title } = Typography;

const ForgotPassword = () => {
  const { user } = useApi();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const response = await user.user.forgotPassword(values.email);
    
    if (response.success) {
      message.success("Password reset email sent!");
    } else {
      message.error(response.error || "Failed to send reset email.");
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ maxWidth: "400px", width: "100%", padding: "20px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}>
        <Title level={2} style={{ textAlign: "center" }}>Нууц үг сэргээх</Title>
        <Form name="forgot-password" onFinish={onFinish}>
          <Form.Item name="email" rules={[{ required: true, message: "Please enter your email!" }]}>
            <Input placeholder="И-мэйл хаяг" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              Илгээх
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
