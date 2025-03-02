import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Button } from "antd";
import {
  LeftOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Mock trip data
const trips = [
  {
    id: 1,
    image: "/images/nature2.jpg",
    title: "Beach Getaway",
    days: 5,
    price: 1200,
    description:
      "Enjoy a relaxing vacation on a tropical beach with golden sand and crystal-clear water.",
  },
  {
    id: 2,
    image: "/images/nature1.jpg",
    title: "Mountain Escape",
    days: 7,
    price: 1500,
    description:
      "Explore the breathtaking mountains and experience thrilling hikes with scenic views.",
  },
  {
    id: 3,
    image: "/images/nature3.jpg",
    title: "City Tour",
    days: 3,
    price: 1000,
    description:
      "Discover the beauty of urban life, famous landmarks, and cultural experiences in a vibrant city.",
  },
];

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the selected trip based on ID
  const trip = trips.find((trip) => trip.id === parseInt(id));

  if (!trip) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>
        Trip not found!
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "600px",
          borderRadius: "12px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
        cover={
          <img
            alt={trip.title}
            src={trip.image}
            style={{
              height: "300px",
              objectFit: "cover",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          />
        }
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: "10px" }}>
          {trip.title}
        </Title>
        <Text
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "16px",
            marginBottom: "10px",
          }}
        >
          <CalendarOutlined style={{ marginRight: "8px", color: "#1890ff" }} />{" "}
          {trip.days} Days
        </Text>
        <Text
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          <DollarCircleOutlined
            style={{ marginRight: "8px", color: "#52c41a" }}
          />{" "}
          ${trip.price}
        </Text>
        <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>
          {trip.description}
        </Text>
        <Button
          type="primary"
          icon={<LeftOutlined />}
          onClick={() => navigate("/")}
          style={{ marginTop: "20px", width: "100%" }}
        >
          Back to Trips
        </Button>
      </Card>
    </div>
  );
};

export default TripDetail;
