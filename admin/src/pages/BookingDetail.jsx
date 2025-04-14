import React, { useEffect, useState } from "react";
import { Card, Descriptions, Spin, Button, List, Image, Divider, Tag } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import useApi from "../hook/useApi";
import ButtonGroup from "antd/es/button/button-group";
import usePermissions from "../hook/usePermissions";

const BookingDetail = () => {
    const { hasPermission, isSuperuser } = usePermissions();
    const { id } = useParams();
    const navigate = useNavigate();
    const { booking } = useApi();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBookingDetail = async () => {
        setLoading(true);
        try {
            const response = await booking.book.detail(id);
            setData(response);
        } catch (error) {
            console.error("Error fetching booking detail:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingDetail();
    }, [id]);

    if (loading) return <Spin fullscreen />;
    if (!data) return <div>No Booking Found!</div>;

    return (
        <div>
            <Card
                title={<Button onClick={() => navigate(-1)}>Буцах</Button>}
                extra={<Button type="primary" onClick={() => navigate(-1)}>Хэвлэх</Button>}
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Аялалын ID">{data.trip_id}</Descriptions.Item>
                    <Descriptions.Item label="Захиалга ID">{data.id}</Descriptions.Item>
                    <Descriptions.Item label="Захиалагч">{data.user?.username}</Descriptions.Item>
                    <Descriptions.Item label="Төлөв">
                        <Tag color={data.status === "CANCELED" ? "red" : "green"}>
                            {data.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Захиалсан огноо">{data.booking_date}</Descriptions.Item>
                    <Descriptions.Item label="Эхлэх огноо">{data.checkin_date}</Descriptions.Item>
                    <Descriptions.Item label="Дуусах огноо">{data.checkout_date}</Descriptions.Item>
                    <Descriptions.Item label="Үнийн дүн">{data.total_price}$</Descriptions.Item>
                </Descriptions>
            </Card>

            <Divider orientation="left">Захиалгын мэдээлэл</Divider>
            {
                data.booking_camps
                    .sort((a, b) => a.day - b.day)
                    .map((camp) => {

                        const totalRoomPrice = camp.booking_rooms.reduce((total, room) => {
                            return total + room.room.price_per_night * room.count;
                        }, 0);

                        // Add the day price of $100
                        const totalPrice = totalRoomPrice + 100;
                        return (
                            <Card key={camp.camp_id} title={<>{camp.details.name} - Өдөр {camp.day}</>} style={{ marginTop: 20 }}>
                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label="Аялах газар">{camp.details.place}</Descriptions.Item>
                                    <Descriptions.Item label="Огноо">{camp.checkin_date} - {camp.checkout_date}</Descriptions.Item>
                                    <Descriptions.Item label="Хүний тоо">{camp.people_count}</Descriptions.Item>
                                    <Descriptions.Item label="Өдрийн ханш">${totalPrice}</Descriptions.Item>
                                    <Descriptions.Item label="Байрлах газрын багтаамж">{camp.details.capacity}</Descriptions.Item>
                                </Descriptions>

                                <Divider orientation="left">Захиалсан өрөө</Divider>
                                <div className="d-flex gap-3">
                                    {camp.booking_rooms.map((room) => (
                                        <Card key={room.room_id} title={room.room.name} style={{ marginTop: 10 }}>
                                            <Image width={250} height={150} src={room.room.image_url} />
                                            <p>Захиалсан тоо: {room.count}</p>
                                            <p>Нэгж үнэ: ${room.room.price_per_night}</p>
                                            <p>Нийт үнэ: ${room.room.price_per_night * room.count}</p>
                                        </Card>
                                    ))}
                                </div>
                            </Card>
                        )
                    })
            }
            {
                isSuperuser && data.status === 'PENDING' &&
                <Card>
                    <ButtonGroup style={{ float:'right'}}>
                        <Button type="primary" danger size="large" >Цуцлах</Button>
                        <Button type="primary" size="large">Батлах</Button>
                    </ButtonGroup>
                </Card>
            }
             {
                data.status === 'CANCELED' &&
                <Card>
                    <Button type="primary" danger size="large" >Устгах</Button>
                </Card>
            }

        </div>
    );
};

export default BookingDetail;
