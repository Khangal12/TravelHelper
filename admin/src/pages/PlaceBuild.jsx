import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button, Input } from "antd";
import { useNavigate } from "react-router-dom";
import useApi from "../hook/useApi";
import usePermissions from "../hook/usePermissions";

const { Title, Text } = Typography;
const { Search } = Input;

const PlaceBuild = () => {
  const { isUser } = usePermissions()
  const { admin } = useApi()
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchPlaces = async (query = "") => {
    try {
      const data = await admin.place.get(query);
      setPlaces(data);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  useEffect(() => {
    fetchPlaces(searchTerm);
  }, [searchTerm]);

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Add Button */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", marginLeft: "6.5rem", marginRight: "6.5rem" }}>
        <Search
          placeholder="Газрын нэр"
          allowClear
          enterButton="Хайх"
          size="large"
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "300px" }}
        />
        {
          !(isUser) &&
          <Button type="primary" size="large" onClick={() => navigate(`new`)}>
            Нэмэх
          </Button>
        }

      </div>

      {/* Place Cards */}
      {places.map((place) => (
        <Row
          key={place.id}
          justify="center"
          gutter={[16, 16]}
          style={{ marginBottom: "20px" }}
        >
          <Col xs={24} md={18} lg={20}>
            <Card
              hoverable
              style={{
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                border: "none",
                padding: "0",
                display: "flex", // Ensures content stretches
                flexDirection: "row", // Forces image + text to be side by side
                height: "200px", // Set a fixed height (adjustable)
              }}
              bodyStyle={{ padding: 0, flex: 1 }} // Ensures full stretch
            >
              <Row style={{ width: "100%", height: "100%" }}>
                {/* Image Section - Forces full height */}
                <Col xs={24} md={8} style={{ height: "100%", flex: 1 }}>
                  <img
                    alt={place.name}
                    src={place.image_url}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover", // Prevents distortion
                      borderTopLeftRadius: "10px",
                      borderBottomLeftRadius: "10px",
                    }}
                  />
                </Col>

                {/* Details Section */}
                <Col
                  xs={24}
                  md={16}
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Title level={4} style={{ margin: 0 }}>
                    {place.title}
                  </Title>
                  <p
                    style={{
                      marginTop: "10px",
                      fontSize: "12px",
                      marginTop: "10px",
                      fontSize: "12px",
                      lineHeight: "1.5",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      WebkitLineClamp: 4,
                    }}
                  >
                    {place.description}
                  </p>
                  <Row
                    justify="space-between"
                    style={{
                      marginTop: "10px",
                      alignItems: "center",
                    }}
                  >
                    {/* Capacity Text */}
                    <Text
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    ></Text>

                    {/* "More" Button */}
                    <Button
                      onClick={() =>
                        navigate(`/places/${place.id}`, {
                          state: { placeData: place },
                        })
                      } // Adjust the navigation path accordingly
                    >
                      Дэлгэрэнгүй
                    </Button>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default PlaceBuild;
