import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Upload, message, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useApi from "../hook/useApi";

const roomOptions = [1, 2, 3, 4, 5]; // Representing 1 to 5 rooms

const CampAdd = () => {
  const {admin} = useApi()
  const [form] = Form.useForm();
  const [roomCount, setRoomCount] = useState(1); // Default room count is 1
  const [places, setPlaces] = useState([]);

  // Handle the room count change (number of rooms)
  const handleRoomCountChange = (value) => {
    setRoomCount(value);
  };

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await admin.place.get(); // Replace with your API endpoint
        setPlaces(response); // Assuming the response is an array of places
      } catch (error) {
        message.error("An error occurred while fetching places.");
      }
    };

    fetchPlaces();
  }, []);

  // Handle form submission
  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("place", values.place);
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("capacity", values.capacity);
    formData.append("image", values.image[0]?.originFileObj);
    formData.append("roomcount", roomCount);

    // Loop through rooms and add them to the form data
    for (let i = 1; i <= roomCount; i++) {
      formData.append(`room_${i}_name`, values[`room_${i}_name`]);
      formData.append(`room_${i}_capacity`, values[`room_${i}_capacity`]);
      formData.append(
        `room_${i}_image`,
        values[`room_${i}_image`]?.[0]?.originFileObj
      );
      formData.append(`room_${i}_price`, values[`room_${i}_price`]);
    }
    try {
      const response = await admin.camp.post(formData);
      if (response.status === "success") {
        message.success("Camp added successfully!");
        form.resetFields(); // Reset form after successful submission
        setRoomCount(1); // Reset room count to 1
      } else {
        message.error("Error adding camp!");
      }
    } catch (error) {
      message.error("An error occurred while submitting the form.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Шинэ амралтын газар нэмэх</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row gutter={24}>
          {/* Row 1 */}
          <Col span={12}>
            <Form.Item
              label="Ойролцоох газар"
              name="place"
              rules={[{ required: true, message: "Газараа сонгон уу!" }]}
            >
              <Select placeholder="Газар" allowClear>
                {places.length > 0 ? (
                  places.map((place) => (
                    <Select.Option key={place.id} value={place.id}>
                      {place.image && (
                        <img
                          src={place.image}
                          alt={place.title}
                          style={{ width: 30, height: 30, marginRight: 10 }}
                        />
                      )}
                      {place.title}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option disabled>No places available</Select.Option>
                )}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Амралтын газрын нэр"
              name="name"
              rules={[
                { required: true, message: "Please enter the camp name!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          {/* Row 2 */}
          <Col span={12}>
            <Form.Item
              label="Дэлгэрэнгүй"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Please enter the camp description!",
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Багтаамж"
              name="capacity"
              rules={[
                { required: true, message: "Please enter the camp capacity!" },
              ]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label={`Зураг`}
              name={`image`}
              valuePropName="fileList"
              getValueFromEvent={({ fileList }) => fileList}
              rules={[
                {
                  required: true,
                  message: `Please upload an image for camp!`,
                },
              ]}
            >
              <Upload
                listType="picture"
                beforeUpload={() => false} // Prevent automatic upload
              >
                <Button icon={<UploadOutlined />}>Оруулах</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          {/* Select number of rooms */}
          <Col span={12}>
            <Form.Item
              label="Өрөөний тоо"
              name="roomCount"
              rules={[
                { required: true, message: "Please select number of rooms!" },
              ]}
            >
              <Select defaultValue={roomCount} onChange={handleRoomCountChange}>
                {roomOptions.map((roomNumber) => (
                  <Select.Option key={roomNumber} value={roomNumber}>
                    {roomNumber} өрөө
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Dynamic fields for rooms */}
        {[...Array(roomCount)].map((_, index) => {
          const roomIndex = index + 1;
          return (
            <Row key={roomIndex} gutter={24}>
              <Col span={6}>
                <Form.Item
                  label={`Өрөө №${roomIndex} нэр`}
                  name={`room_${roomIndex}_name`}
                  rules={[
                    {
                      required: true,
                      message: `Please enter name for Room ${roomIndex}!`,
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                label={`Өрөө №${roomIndex} багтаамж`}
                  name={`room_${roomIndex}_capacity`}
                  rules={[
                    {
                      required: true,
                      message: `Please enter capacity for Room ${roomIndex}!`,
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label={`Өрөө №${roomIndex} үнэ`}
                  name={`room_${roomIndex}_price`}
                  rules={[
                    {
                      required: true,
                      message: `Please enter price for Room ${roomIndex}!`,
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label={`Өрөө №${roomIndex} зураг`}
                  name={`room_${roomIndex}_image`}
                  valuePropName="fileList"
                  getValueFromEvent={({ fileList }) => fileList}
                  rules={[
                    {
                      required: true,
                      message: `Please upload an image for Room ${roomIndex}!`,
                    },
                  ]}
                >
                  <Upload
                    listType="picture"
                    beforeUpload={() => false} // Prevent automatic upload
                  >
                    <Button icon={<UploadOutlined />}>Өрөөний зураг</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          );
        })}

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Хадгалах
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CampAdd;
