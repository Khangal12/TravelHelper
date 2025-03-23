import React, { use, useEffect, useState } from "react";
import { Button, Card, Col, Row, Typography, Divider,Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import { ArrowLeftOutlined } from "@ant-design/icons";
import useApi from "../hook/useApi";

const { Title, Text } = Typography;

const CampDetails = () => {
  const {admin} = useApi()
  const [camp, setCamp] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchCampDetails = async () => {
      try {
        setLoading(true); // Start loading
        const response = await admin.camp.getDetail(id);
        if (response) {
          setCamp(response);
        }
      } catch (error) {
        console.error("Error fetching camp details:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchCampDetails();
  }, [id]);

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
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : (
    <>
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
              {camp.rooms?.length > 0 ? (
                camp.rooms.map((room, index) => (
                  <Col key={index} xs={24} sm={12} md={8} lg={10}>
                    <RoomCard room={room} />
                  </Col>
                ))
              ) : (
                <Text>Өрөөний мэдээлэл байхгүй.</Text>
              )}
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
      </>
          )
        }
    </div>
    
  );
};

export default CampDetails;
