// RoomCard.js
import React from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const RoomCard = ({ room }) => {
  return (
    <Card
      bordered={false}
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <Title level={4}>{room.name}</Title>
      <Text>Capacity: {room.capacity} guests</Text>
      <br />
      <Text>Price per night: ${room.price_per_night}</Text>
      {room.image && (
        <img
          alt={room.name}
          src={room.image_url}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            marginTop: "10px",
            borderRadius: "8px",
          }}
        />
      )}
    </Card>
  );
};

export default RoomCard;
