import React, {useState,useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Button } from "antd";
import {
  RightOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  UserOutlined,
  LeftOutlined
} from "@ant-design/icons";
import useApi from "../hook/useApi";

const { Title, Text } = Typography;


const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detailData , setTripDetail] = useState()
  const { trip } = useApi();

  const fetchData = async () => {
    try {
      const response = await trip.trip.getDetail(id);
      setTripDetail(response[0]);
    } catch (error) {
      console.error("Error fetching place and camp data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!detailData) {
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
        flexDirection:"column",
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
            alt={detailData.name}
            src={detailData.image}
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
          {detailData.name}
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
          {detailData.days} Өдөр
        </Text>
        <Text
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "16px",
            marginBottom: "10px",
          }}
        >
          <UserOutlined style={{ marginRight: "8px", color: "#1899999" }} />{" "}
          {detailData.user.username}
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
          ${detailData.total_price}
        </Text>
        
        <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>
          {detailData.description}
        </Text>
        <Button
          type="primary"
          icon={<RightOutlined />}
          onClick={() => navigate(`/detail/trip/${id}/`)}
          style={{ marginTop: "20px", width: "100%" }}
        >
          Дэлгэрэнгүй
        </Button>
      </Card>
    </div>
  );
};

export default TripDetail;
