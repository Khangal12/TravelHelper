import React from "react";
import { Card, Typography } from "antd";
import {
  LeftOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
const { Meta } = Card;
const { Title, Text } = Typography;

const TripCard = ({ created_user, name, days,image ,total_price, onClick }) => {
  return (
    <Card
      hoverable
      style={{ fontSize: "12px", width: 250 }}
      cover={
        <img
          alt={name}
          src={image}
          style={{ height: "100px", objectFit: "cover" }}
        />
      }
      onClick={onClick}
    >
      <Meta
        title={
          <span
            style={{
              fontSize: "12px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block",
            }}
          >
            {name}
          </span>
        }
      />

      {/* Flexbox for Days & Price */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between", // 🔹 Spread items apart
          alignItems: "center",
          marginTop: "10px",
          fontSize: "10px",
        }}
      >
        <Text
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "10px",
          }}
        >
          <CalendarOutlined style={{ marginRight: "5px", color: "#1890ff" }} />{" "}
          {days} Days
        </Text>
        <Text
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "10px",
          }}
        >
          <DollarCircleOutlined
            style={{ marginRight: "5px", color: "#52c41a" }}
          />{" "}
          ${total_price}
        </Text>
      </div>
    </Card>
  );
};

export default TripCard;
