import React, { use, useEffect, useState } from "react";
import { Button, Card, Col, Row, Typography, Divider } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import { ArrowLeftOutlined } from "@ant-design/icons";
import useApi from "../hook/useApi";

const { Title, Text } = Typography;

const CampDetails = () => {
  const [camp, setCamp] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const campApi = useApi().camp;
  // Fetch the camp details using the ID from the route params
  useEffect(() => {
    const fetchCampDetails = async () => {
      try {
        const response = await campApi.getDetail(id);
        setCamp(response.data);
      } catch (error) {
        console.error("Error fetching camp details:", error);
      }
    };
    fetchCampDetails();
  }, [id]);

  // Render loading state while fetching data
  if (!camp) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Text>Loading...</Text>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", padding: "40px" }}>
      {/* Header with back arrow */}
      <div style={{ marginBottom: "20px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)} // Navigate back to the previous page
          style={{
            border: "none",
            background: "transparent",
            fontSize: "18px",
          }}
        >
          Back
        </Button>
      </div>
      {/* Camp Banner Image */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <img
          alt={camp.name}
          src={camp.image_url}
          style={{
            width: "100%",
            height: "400px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
        <Title
          level={1}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          {camp.name}
        </Title>
      </div>

      {/* Camp Details Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <Title level={2}>About {camp.name}</Title>
            <Text>{camp.description}</Text>
          </Card>

          <Divider />

          {/* Room Details Section */}
          <Card
            bordered={false}
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <Title level={3}>Room Details</Title>
            <Row gutter={[16, 16]}>
              {camp.rooms.map((room, index) => (
                <Col key={index} xs={24} sm={12} md={8} lg={10}>
                  {/* Each RoomCard inside a Col */}
                  <RoomCard room={room} />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Booking Section */}
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <Title level={3}>Info</Title>
            <Text strong>Capacity: {camp.capacity}</Text>
            <br />
            <Text strong>Location: Near {camp.place}</Text>
            <br />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CampDetails;
