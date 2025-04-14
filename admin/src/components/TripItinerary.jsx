import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Divider, Timeline,InputNumber, Tag, Button, Space, Image, Modal, Checkbox } from 'antd';
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  CalendarOutlined,
  StarOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';

const TripItinerary = ({ itinerary, onTotalPriceChange,onSelectedRoomsChange }) => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState({});
  const [return_data, setReturnData] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [roomQuantities, setRoomQuantities] = useState({}); // Add new state for quantities

  const calculateTotalPrice = () => {
    const total = itinerary.reduce((acc, day) => {
      const dayTotal = (
        day.price + // Base price
        getSelectedRoomPrice(day.id) // Room prices
      );
      return acc + dayTotal;
    }, 0);

    // Notify parent component of price changes
    if (onTotalPriceChange) {
      onTotalPriceChange(total);
    }
    return total;
  };

  // Add useEffect to update total price when selections change
  useEffect(() => {
    calculateTotalPrice();
    const finalData = Object.values(return_data);
    if (onSelectedRoomsChange) {
      onSelectedRoomsChange(finalData);
    }
  }, [selectedRooms,roomQuantities,return_data]);

  const toggleDescription = (id) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRoomChange = (dayId, room, quantity,camp,day_number,capacity) => {
    const key = `${dayId}_${room.id}`;

    setRoomQuantities(prev => ({
      ...prev,
      [key]: quantity
    }));

    setSelectedRooms(prev => {
      if (quantity > 0) {
        return { ...prev, [key]: room.price_per_night * quantity };
      } else {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      }
    });
    setReturnData(prev => {
      const updated = { ...prev };
      if (quantity > 0) {
        updated[key] = {
          camp,
          room_id: room.id,
          quantity,
          day_number,
          capacity
        };
      } else {
        delete updated[key];
      }
      return updated;
    });
  };

  const getSelectedRoomPrice = (dayId) => {
    return Object.keys(selectedRooms)
      .filter(key => key.startsWith(`${dayId}_`))
      .reduce((acc, key) => acc + Number(selectedRooms[key] || 0), 0);
  };


  return (
    <div style={{ padding: '24px 16px', backgroundColor: '#f0f2f5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Card
          title="Аялалын маршрут"
          headStyle={{ fontSize: 24, fontWeight: 'bold' }}
          style={{ marginBottom: 24 }}
        >
          <Timeline mode="alternate">
            {itinerary.map((day, index) => (
              <Timeline.Item
                key={day.id}
                dot={<div style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  backgroundColor: '#1890ff',
                  color: 'white',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -8
                }}>
                  {day.day_number}
                </div>}
                style={{ paddingBottom: 32 }}
              >
                <Card
                  title={
                    <Space>
                      <CalendarOutlined />
                      <span style={{ fontSize: 18 }}>{day.title} - {day.date}</span>
                      <Tag color="red" style={{ fontSize: 14 }}>
                        Үнэ: {day.price + getSelectedRoomPrice(day.id)}$
                      </Tag>

                      <Tag color="blue" style={{ fontSize: 14 }}>
                        {day.distance_from_prev} км
                      </Tag>
                    </Space>
                  }
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
                >
                  {/* Camp/Accommodation Section */}
                  {day.camp && (
                    <div style={{ marginBottom: 24 }}>
                      <Divider orientation="left" orientationMargin={0}>
                        <Space>
                          <HomeOutlined />
                          <span style={{ fontWeight: 500 }}>Байрлах газар</span>
                        </Space>
                      </Divider>
                      <Row gutter={16} align="middle">
                        <Col xs={24} md={16} order={1}>
                          <h3 style={{ marginTop: 0 }}>{day.camp.name}</h3>
                          <div style={{
                            position: 'relative',
                            maxHeight: expandedDescriptions[`camp-${day.id}`] ? 'none' : '4.5em',
                            overflow: 'hidden'
                          }}>
                            <p>{day.camp.description}</p>
                            {!expandedDescriptions[`camp-${day.id}`] && (
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '2em',
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))'
                              }} />
                            )}
                          </div>
                          <Button
                            type="link"
                            onClick={() => toggleDescription(`camp-${day.id}`)}
                            icon={expandedDescriptions[`camp-${day.id}`] ? <UpOutlined /> : <DownOutlined />}
                          >
                            {expandedDescriptions[`camp-${day.id}`] ? 'Show Less' : 'Show More'}
                          </Button>
                          <Space>
                            <Tag icon={<EnvironmentOutlined />} color="blue">
                              {day.camp.place}
                            </Tag>
                            <Tag color="green">Capacity: {day.camp.capacity}</Tag>
                          </Space>
                        </Col>
                        <Col xs={24} md={8} order={2}>
                          <Image
                            src={day.camp.image_url}
                            alt={day.camp.name}
                            style={{
                              borderRadius: 8,
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover'
                            }}
                            preview={false}
                          />
                        </Col>
                      </Row>
                      <Col style={{ marginTop: 12 }}>
                        <Button
                          type="primary"
                          onClick={() => {
                            setSelectedDay(day);
                            setIsModalVisible(true);
                          }}
                        >
                          Өрөө сонгох
                        </Button>
                        {day.camp.rooms.length > 0 && (
                          <Tag color="orange">
                            {day.camp.rooms.length} өрөө / {Object.keys(roomQuantities)
                              .filter(key => key.startsWith(`${day.id}_`))
                              .reduce((acc, key) => acc + (roomQuantities[key] || 0), 0)} сонгосон
                          </Tag>
                        )}
                      </Col>
                    </div>
                  )}

                  {/* Places Section */}
                  {day.place && day.place.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <Divider orientation="left" orientationMargin={0}>
                        <Space>
                          <EnvironmentOutlined />
                          <span style={{ fontWeight: 500 }}>Аялах газар</span>
                        </Space>
                      </Divider>
                      {day.place.map((place, idx) => (
                        <Card key={idx} style={{ marginBottom: 16 }}>
                          <Row gutter={16} align="middle">
                            <Col xs={24} md={16} order={1}>
                              <h3 style={{ marginTop: 0 }}>{place.title}</h3>
                              <div style={{
                                position: 'relative',
                                maxHeight: expandedDescriptions[`place-${day.id}-${idx}`] ? 'none' : '4.5em',
                                overflow: 'hidden'
                              }}>
                                <p>{place.description}</p>
                                {!expandedDescriptions[`place-${day.id}-${idx}`] && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '2em',
                                    background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))'
                                  }} />
                                )}
                              </div>
                              <Button
                                type="link"
                                onClick={() => toggleDescription(`place-${day.id}-${idx}`)}
                                icon={expandedDescriptions[`place-${day.id}-${idx}`] ? <UpOutlined /> : <DownOutlined />}
                              >
                                {expandedDescriptions[`place-${day.id}-${idx}`] ? 'Show Less' : 'Show More'}
                              </Button>
                              <Space>
                                <Tag icon={<StarOutlined />} color="gold">
                                  Attraction
                                </Tag>
                              </Space>
                            </Col>
                            <Col xs={24} md={8} order={2}>
                              <Image
                                src={place.image_url}
                                alt={place.title}
                                style={{
                                  borderRadius: 8,
                                  width: '100%',
                                  height: '200px',
                                  objectFit: 'cover'
                                }}
                                preview={false}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Activities Section */}
                  {day.description && (
                    <div>
                      <Divider orientation="left" orientationMargin={0}>
                        <Space>
                          <ClockCircleOutlined />
                          <span style={{ fontWeight: 500 }}>Activities</span>
                        </Space>
                      </Divider>
                      <p>{day.description}</p>
                    </div>
                  )}
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      </div>
      <Modal
        title={`${selectedDay?.camp?.name || ''} - Өрөө сонгох`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => {
          setIsModalVisible(false);
        }}
      >
        {selectedDay && (
          <div>
            {selectedDay.camp.rooms.map(room => (
              <div key={room.id} style={{ marginBottom: 16 }}>
                <Card>
                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={8}>
                      <Image
                        src={room.image_url}
                        alt={room.name}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                        preview={false}
                      />
                    </Col>
                    <Col xs={24} sm={16}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <h4 style={{ margin: '0 0 8px 0' }}>{room.name}</h4>
                          <Space direction="vertical" size="small">
                            <Tag icon={<HomeOutlined />} color="blue">
                              Багтаамж: {room.capacity} хүн
                            </Tag>
                            <p style={{ margin: 0 }}>Үнэ: {room.price_per_night}$</p>
                          </Space>
                        </Col>
                        <Col>
                          <Space direction="vertical" size="small" align="end">
                            <span>Тоо:</span>
                            <InputNumber
                              min={0}
                              value={roomQuantities[`${selectedDay.id}_${room.id}`] || 0}
                              onChange={(value) => handleRoomChange(selectedDay.id, room, value,selectedDay.camp.id,selectedDay.day_number,selectedDay.camp.capacity || 0)}
                              style={{ width: '80px' }}
                            />
                          </Space>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TripItinerary;