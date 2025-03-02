import React from "react";
import { useLocation } from "react-router-dom";
import { Button, Card, Col, Row, Typography, Divider, Image } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Map from "../components/Map"; // Assuming you have a Map component

const { Title, Text } = Typography;

const PlaceDetail = () => {
  const location = useLocation();
  const { placeData } = location.state || {}; // Get the place data passed from the previous page

  if (!placeData) {
    return <div>Loading...</div>; // Handle the case where no place data is passed
  }

  const { title, description, latitude, longitude, image_url } = placeData; // Destructure the place data

  return (
    <div style={{ padding: "40px", backgroundColor: "#f5f5f5" }}>
      <Row gutter={[16, 16]}>
        {/* Back Button */}
        <Col span={24}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            style={{
              marginBottom: "20px",
              backgroundColor: "#1890ff",
              color: "#fff",
              border: "none",
            }}
          >
            Back
          </Button>
        </Col>
      </Row>

      {/* Map Section */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <Title level={3}>Location</Title>
            {/* Render the map component, passing the lat and lng */}
            <Map lat={latitude} lng={longitude} />
          </Card>
        </Col>
      </Row>

      {/* Title, Description and Image Section */}
      <Row gutter={[16, 16]} className="mt-3">
        <Col xs={24} md={8}>
          {/* Image Section */}
          {image_url && (
            <Card
              bordered={false}
              style={{
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
              }}
            >
              <Image
                src={image_url}
                alt={title}
                style={{
                  width: "100%",
                  height: "auto", // Ensures the image height adjusts automatically based on the width
                  borderRadius: "10px",
                  objectFit: "contain",
                }}
              />
            </Card>
          )}
        </Col>

        <Col xs={24} md={16}>
          {/* Title and Description Section */}
          <Card
            bordered={false}
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <Title level={2}>{title}</Title>
            <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>
              {description}
            </Text>
          </Card>
        </Col>
      </Row>

      <Divider />
    </div>
  );
};

export default PlaceDetail;
