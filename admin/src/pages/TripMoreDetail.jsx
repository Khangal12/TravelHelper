import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Divider, Timeline, Tag, Button, Space } from 'antd';
import {
    CalendarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    UserOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import useApi from '../hook/useApi';
import { useParams, useNavigate } from "react-router-dom";
import TripItinerary from '../components/TripItinerary';
import usePermissions from '../hook/usePermissions';
import axios from 'axios';
import ApproveModal from '../components/ApproveModal';
import CancelModal from '../components/CancelModal';

const TripDetailsPage = () => {
    // Sample trip data
    const { isSuperuser, isUser } = usePermissions()

    const { id } = useParams();
    const navigate = useNavigate();
    const [trips, setTripDetail] = useState()
    const [count, setCount] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCancelModalOpen, setCancelModalOpen] = useState(false);
    const { trip } = useApi();
    const { booking } = useApi();
    const [totalPrice, setTotalPrice] = useState(0);
    const [bookedRoom, setBooking] = useState([]);


    const handleSelectedRoomsChange = (selectedRooms) => {
        setBooking(selectedRooms)
    };

    const handleTotalPriceChange = (price) => {
        setTotalPrice(price);
    };


    const fetchData = async () => {
        try {
            const response = await trip.trip.getDetail(id);
            setTripDetail(response[0]);
        } catch (error) {
            console.error("Error fetching place and camp data:", error);
        }
    };

    const fetchCount = async () => {
        try {
            const response = await booking.book.count(id);
            setCount(response.count);
        } catch (error) {
            console.error("Error fetching place and camp data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCount()
    }, [id]);

    if (!trips) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>
            </div>
        );
    }

    const handleModal = () => {
        setIsModalOpen(true);
    }
    const handleCloseModal = () => {
        setIsModalOpen(false);
    }
    const handleCancel = () => {
        setCancelModalOpen(true)
    }
    const handleCancelModal = () => {
        setCancelModalOpen(false)
    }


    const createPdf = async () => {
        try {
            axios.post('http://localhost/api/trip/pdf/', trips, {
                withCredentials: true,  // If using cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'blob'  // Required for file downloads
            })
                .then(response => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'itinerary.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                })
                .catch(error => {
                    console.error('Download failed:', error);
                });
        } catch (error) {
            console.error("Error fetching place and camp data:", error);
        }
    };

    return (
        <div className="trip-details-container" style={{
            padding: '24px 16px',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5'
        }}>
            {/* Main Content Area */}
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Hero Section with Trip Image */}
                <Card
                    cover={
                        <div style={{
                            height: 300,
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${trips.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: 24,
                            color: 'white',
                            position: 'relative'
                        }}>
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                style={{
                                    position: 'absolute',
                                    top: 16,
                                    left: 16,
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    border: 'none'
                                }}
                                onClick={() => window.history.back()}
                            />

                            <h1 style={{ fontSize: 28, margin: 0 }}>{trips.name}</h1>
                        </div>
                    }
                    bordered={false}
                    style={{ marginBottom: 24 }}
                >
                    <div style={{ padding: '0 16px' }}>
                        <p style={{ fontSize: 16, marginBottom: 16 }}>{trips.description}</p>

                        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                            <Col xs={24} sm={12} md={6}>
                                <Card size="small">
                                    <Space>
                                        <CalendarOutlined />
                                        <div>
                                            <div style={{ fontWeight: 500 }}>Хугацаа</div>
                                            <div>{trips.start_date} to {trips.end_date}</div>
                                        </div>
                                    </Space>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card size="small">
                                    <Space>
                                        <DollarOutlined />
                                        <div>
                                            <div style={{ fontWeight: 500 }}>Үнэ</div>
                                            <div>${trips.total_price}</div>
                                        </div>
                                    </Space>
                                </Card>
                            </Col>
                            {
                                trips.static && (
                                    <>
                                        <Col xs={24} sm={12} md={6}>
                                            <Card size="small">
                                                <Space>
                                                    <UserOutlined />
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>Багтаамж</div>
                                                        <div>{trips.capacity}</div>
                                                    </div>
                                                </Space>
                                            </Card>
                                        </Col>
                                        <Col xs={24} sm={12} md={6}>
                                            <Card size="small">
                                                <Space>
                                                    <UserOutlined />
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}> Захиалсан хүмүүс</div>
                                                        <div>{count}</div>
                                                    </div>
                                                </Space>
                                            </Card>
                                        </Col>
                                    </>
                                )
                            }
                        </Row>
                        {isUser && (trips.status === null || trips.status === 'CANCELED') && (
                            <Button type="primary" size="large" onClick={handleModal}>
                                Яг одоо захиалах
                            </Button>
                        )}

                        {isUser && trips.status === 'PENDING' && (
                            <>
                                <Button type="primary" size="large" style={{ backgroundColor: '#FFA500', borderColor: '#FFA500' }}>
                                    Захиалсан
                                </Button>
                                <Button danger size="large" onClick={handleCancel} style={{ marginLeft: '10px' }}>
                                    Цуцлах
                                </Button>
                            </>
                        )}

                        {isUser && trips.status === 'APPROVED' && (
                            <Button type="primary" size="large" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                                Баталгаажсан
                            </Button>
                        )}
                    </div>
                </Card>


                <TripItinerary itinerary={trips.detail} onTotalPriceChange={handleTotalPriceChange} onSelectedRoomsChange={handleSelectedRoomsChange} />

                {isUser &&
                    <Card style={{ textAlign: 'center' }}>
                        <Space>
                            <Button type="primary" size="large">Захиалах</Button>
                            <Button size="large" onClick={() => createPdf()}>PDF</Button>
                        </Space>
                    </Card>}
                {
                    isModalOpen && (
                        <ApproveModal
                            isModalOpen={isModalOpen}
                            handleCancel={handleCloseModal}
                            data={trips}
                            camps={bookedRoom}
                            totalPrice={totalPrice}
                            onSuccess={fetchData}
                        />
                    )
                }
                {
                    isCancelModalOpen && (
                        <CancelModal
                            isModalOpen={isCancelModalOpen}
                            handleCancel={handleCancelModal}
                            id={id}
                            onSuccess={fetchData}
                        />
                    )
                }
            </div>
        </div>
    );
};

export default TripDetailsPage;