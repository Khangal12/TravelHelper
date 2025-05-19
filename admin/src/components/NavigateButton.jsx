import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'antd';

const { Meta } = Card;

const NavigateButton = ({ payload }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trip/${payload.tripId}`);
  };

  return (
    <Card
      hoverable
      style={{ width: 240, margin: '10px 0' }}
      cover={
        <img 
          alt="Trip preview" 
          src={payload.image || 'https://via.placeholder.com/240x160?text=Trip+Image'} 
          style={{ height: 160, objectFit: 'cover' }}
        />
      }
      onClick={handleClick}
    >
      <Meta
        title="Аялалын дэлгэрэнгүй"
        description="Дарна уу"
      />
    </Card>
  );
};

export default NavigateButton;