import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Space, Typography } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { message } from 'antd'; // ✅ Use Ant Design for notifications
import { useNavigate } from "react-router-dom";
import useApi from '../hook/useApi';

const ApproveModal = ({ isModalOpen, handleCancel, data, camps, totalPrice, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [peopleCount, setPeopleCount] = useState(1);
    const { booking } = useApi();

    const handlePeopleCountChange = (value) => {
        setPeopleCount(value); // Update the people count in state when it changes
    };

    const groupCamps = (camps) => {
        const grouped = [];

        camps.forEach(item => {
            const existingGroup = grouped.find(
                (group) => group.camp === item.camp && group.day_number === item.day_number
            );

            if (existingGroup) {
                existingGroup.rooms.push({
                    room_id: item.room_id,
                    quantity: item.quantity,
                });
            } else {
                grouped.push({
                    camp: item.camp,
                    day_number: item.day_number,
                    capacity: item.capacity,
                    rooms: [
                        {
                            room_id: item.room_id,
                            quantity: item.quantity,
                        }
                    ],
                });
            }
        });

        return grouped;
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const bookingData = {
                ...values,
                booking_camps: groupCamps(camps),
                total_price: Math.floor(totalPrice * peopleCount),
                start_date: data.start_date,
                end_date: data.end_date,
                id: data.id,
                capacity: data.capacity,
            }
            const response = await booking.book.createBooking(bookingData);

            if (response) {
                message.success('Booking approved successfully');
                onSuccess();
                handleCancel();
            }
            else {
                message.error(response);
            }
        } catch (error) {
            message.error();
            console.error('Error approving booking:', error);
        } finally {
            setLoading(false);
        }
    };




    return (
        <Modal
            title="Approve Booking"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="Approve"
            cancelText="Cancel"
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Typography.Text strong>
                        Аялалын нэр: {data.name}
                    </Typography.Text>
                    <Typography.Text strong>
                        Огноо: {data.start_date} - {data.end_date}
                    </Typography.Text>
                    <Typography.Text strong>
                        <DollarOutlined  /> Нийт үнэ: {Math.floor(totalPrice * peopleCount)}$
                    </Typography.Text>
                </Space>
                <Form.Item
                    name="people_count"
                    label="Хүний тоо"
                    className='mt-2'
                    rules={[{ required: true, message: 'Хүний тоо оруулна уу!' }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} value={peopleCount}
                        onChange={handlePeopleCountChange} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ApproveModal;