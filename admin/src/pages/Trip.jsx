import React, { useState } from "react";
import TripCard from "../components/Card";
import { Row, Col, Pagination } from "antd";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Trip = () => {
  const navigate = useNavigate();
  const trips = [
    {
      id: 1,
      image: "/images/nature2.jpg",
      title: "Beach Getaway",
      days: 5,
      price: 1200,
    },
    {
      id: 2,
      image: "/images/nature1.jpg",
      title: "Mountain Escape",
      days: 7,
      price: 1500,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },

    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
    {
      id: 3,
      image: "/images/nature3.jpg",
      title: "City Tour",
      days: 3,
      price: 1000,
    },
  ];

  const pageSize = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const currentTrips = trips.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleTripClick = (trip) => {
    navigate(`trip/${trip.id}`);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Row gutter={[16, 16]} justify="center">
        {currentTrips.map((trip) => (
          <Col key={trip.id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <TripCard {...trip} onClick={() => handleTripClick(trip)} />
          </Col>
        ))}
      </Row>

      {/* Pagination Component */}
      <Pagination
        current={currentPage}
        total={trips.length}
        pageSize={pageSize}
        onChange={(page) => setCurrentPage(page)}
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};
export default Trip;
