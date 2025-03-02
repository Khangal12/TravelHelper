import React, { useState } from "react";
import { Form, Select, Button, Card, Avatar, Space, Typography } from "antd";

const { Option } = Select;
const { Title, Text } = Typography;

// Sample Data for Places and Camps
const places = [
  {
    id: 1,
    title: "Beach Paradise",
    image: "/images/nature1.jpg",

    price: 500,
  },
  {
    id: 2,
    title: "Mountain Retreat",
    image: "/images/nature1.jpg",

    price: 700,
  },
  {
    id: 3,
    title: "City Lights",
    image: "/images/nature1.jpg",
    price: 600,
  },
];

const camps = [
  {
    id: 1,
    title: "Luxury Camp",
    image: "/images/nature1.jpg",

    price: 300,
  },
  {
    id: 2,
    title: "Forest Cabin",
    image: "/images/nature1.jpg",

    price: 400,
  },
  {
    id: 3,
    title: "Eco Lodge",
    image: "/images/nature1.jpg",
    price: 350,
  },
];

const TripCreate = () => {
  const [days, setDays] = useState(0);
  const [tripDetails, setTripDetails] = useState([]);

  // Handle number of days selection
  const handleDaysChange = (value) => {
    setDays(value);
    setTripDetails(Array(value).fill({ place: null, camp: null }));
  };

  // Handle place/camp selection
  const handleChange = (index, key, value) => {
    const newDetails = [...tripDetails];
    newDetails[index][key] = value;
    setTripDetails(newDetails);
  };

  const handleSubmit = () => {
    console.log("Trip Created:", { days, tripDetails });
  };

  // Custom render function for Select options
  const renderOption = (option) => (
    <Space>
      <Avatar src={option.image} size={30} />
      <span>{option.title}</span>
      <span style={{ fontWeight: "bold", color: "#1890ff" }}>
        ${option.price}
      </span>
    </Space>
  );

  // Get selected item details
  const getItemDetails = (list, selectedTitle) =>
    list.find((item) => item.title === selectedTitle);

  return (
    <Card title="Create Trip" style={{ width: 400, margin: "20px auto" }}>
      <Form layout="vertical">
        {/* Select Number of Days */}
        <Form.Item label="Select Number of Days">
          <Select
            value={days}
            onChange={handleDaysChange}
            placeholder="Select Days"
          >
            {[...Array(10).keys()].map((num) => (
              <Option key={num + 1} value={num + 1}>
                {num + 1} Days
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Day-wise Selection */}
        {tripDetails.map((trip, index) => (
          <Card
            key={index}
            type="inner"
            title={`Day ${index + 1}`}
            style={{ marginBottom: 10 }}
          >
            {/* Select Place */}
            <Form.Item label="Select Place">
              <Select
                value={trip.place}
                onChange={(value) => handleChange(index, "place", value)}
                placeholder="Choose Place"
                style={{ width: "100%" }}
                optionLabelProp="label"
              >
                {places.map((place) => (
                  <Option
                    key={place.id}
                    value={place.title}
                    label={place.title}
                  >
                    {renderOption(place)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Render Selected Place Details */}
            {trip.place && (
              <Card style={{ marginBottom: 10 }}>
                <Space>
                  <Avatar
                    src={getItemDetails(places, trip.place)?.image}
                    size={60}
                  />
                  <div>
                    <Title level={5}>{trip.place}</Title>
                    <Text strong style={{ color: "#1890ff" }}>
                      ${getItemDetails(places, trip.place)?.price}
                    </Text>
                  </div>
                </Space>
              </Card>
            )}

            {/* Select Camp */}
            <Form.Item label="Select Camp">
              <Select
                value={trip.camp}
                onChange={(value) => handleChange(index, "camp", value)}
                placeholder="Choose Camp"
                style={{ width: "100%" }}
                optionLabelProp="label"
              >
                {camps.map((camp) => (
                  <Option key={camp.id} value={camp.title} label={camp.title}>
                    {renderOption(camp)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Render Selected Camp Details */}
            {trip.camp && (
              <Card>
                <Space>
                  <Avatar
                    src={getItemDetails(camps, trip.camp)?.image}
                    size={60}
                  />
                  <div>
                    <Title level={5}>{trip.camp}</Title>
                    <Text strong style={{ color: "#1890ff" }}>
                      ${getItemDetails(camps, trip.camp)?.price}
                    </Text>
                  </div>
                </Space>
              </Card>
            )}
          </Card>
        ))}

        {/* Submit Button */}
        {days > 0 && (
          <Button type="primary" block onClick={handleSubmit}>
            Create Trip
          </Button>
        )}
      </Form>
    </Card>
  );
};

export default TripCreate;
