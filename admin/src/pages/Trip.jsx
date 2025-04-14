import React, { useState, useEffect } from "react";
import TripCard from "../components/Card";
import { Row, Col, Pagination, Input, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import useApi from "../hook/useApi";

const { Search } = Input;

const Trip = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const { trip } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await trip.trip.get(currentPage, searchTerm);
        setTrips(response.results);
        setTotalItems(response.count);
      } catch (error) {
        console.error("Error fetching trip data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, searchTerm]);

  const handleTripClick = (trip) => navigate(`trip/${trip.id}`);
  const handlePageChange = (page) => setCurrentPage(page);
  const handleSearch = (e) => setSearchTerm(e.target.value);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Search
        placeholder="Аялалын нэр хайх..."
        allowClear
        size="large"
        onChange={handleSearch}
        style={{ maxWidth: "400px", marginBottom: "20px" }}
      />

      {loading ? (
        <>
          <Row>
            <Spin size="large" />
          </Row>
        </>
      ) : (
        <>
          <Row gutter={[12, 12]} justify="center">
            {trips.map((trip) => (
              <Col key={trip.id} xs={4} sm={4} md={4} lg={4} xl={6}>
                <TripCard {...trip} onClick={() => handleTripClick(trip)} />
              </Col>
            ))}
          </Row>
          {totalItems > 8 && (
            <Pagination
              current={currentPage}
              total={totalItems}
              pageSize={8}
              onChange={handlePageChange}
              style={{ marginTop: "20px" }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Trip;
