import React from "react";
import { Card } from "antd";

const { Meta } = Card;

const TripCard = ({ image, title, days, price }) => {
  return (
    <Card
      hoverable
      style={{ fontSize: "12px", width: 150 }}
      cover={
        <img
          alt={title}
          src={image}
          style={{ height: "100px", objectFit: "cover" }}
        />
      }
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
            {title}
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
        <span style={{ color: "#555" }}>{days} days</span>
        <span style={{ fontWeight: "bold", color: "#1890ff" }}>${price}</span>
      </div>
    </Card>
  );
};

export default TripCard;
