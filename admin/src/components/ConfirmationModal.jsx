import { Modal } from "antd";

const ConfirmationModal = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      title="Are you sure?"
      visible={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Yes"
      cancelText="No"
    >
      <p>Your data will be deleted if you leave this page. Are you sure?</p>
    </Modal>
  );
};

export default ConfirmationModal;