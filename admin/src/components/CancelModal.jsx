import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import useApi from '../hook/useApi';

const CancelModal = ({ isModalOpen, handleCancel, id, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { booking } = useApi();

    const handleOk = async () => {
        try {
            setLoading(true);
            
            const response = await booking.book.cancelBooking(id);
            
            if (response) {
                message.success('Захиалга амжилттэй цуцлагдлаа');
                onSuccess();
                handleCancel();
            }
        } catch (error) {
            console.error('Error approving booking:', error);
            message.error('Failed to approve booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Захиалга цуцлах"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="Цуцлах"
            cancelText="Болих"
        >
        </Modal>
    );
};

export default CancelModal;