import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Card,
  DatePicker,
  Input,
  Select,
} from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import useApi from "../hook/useApi";
import { useNavigate } from "react-router-dom";
import usePermissions from "../hook/usePermissions";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Booking = () => {
  const { isSuperuser, isUser } = usePermissions()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { booking } = useApi();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await booking.book.get(page, search, range, status);
      setData(response);
    } catch (error) {
      console.error("Error fetching booking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [page, search, range, status]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Хэрэглэгчийн нэр",
      render: (text, record) => (
        <span>{record.user ? record.user.username : "Unknown"}</span>
      )
    },
    {
      title: "Аялалын нэр",
      render: (text, record) => (
        <span>{record.trip ? record.trip[0].name : "Unknown"}</span>
      )
    },
    {
      title: "Захиалсан огноо",
      dataIndex: "booking_date",
      key: "booking_date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Тоо",
      render: (text, record) => (
        <span>{record.people_count ? record.people_count : "1"}</span>
      )
    },
    {
      title: "Төлбөр",
      render: (text, record) => (
        <span>{record.total_price ? `${record.total_price}$` : "0"}</span>
      )
    },
    {
      title: "Төлөв",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "APPROVED"
              ? "green"
              : status === "PENDING"
                ? "yellow"
                : status === "CANCELED"
                  ? "red"
                  : "default"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Үйлдэл",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small"
            onClick={() => navigate(`/bookings/${record.id}`)}>
            Дэлгэрэнгүй
          </Button>
          {
            isSuperuser && record.status === "PENDING" && (
              <>
                <Button
                  type="primary"
                  size="small"
                  style={{ backgroundColor: 'green', borderColor: 'green' }} 
                  onClick={async () => {
                    await booking.book.approveBooking(record.id);
                    fetchAll();
                  }}
                >
                  Батлах
                </Button>
                <Button
                  type="primary"
                  size="small"
                  danger
                // onClick={() => {
                //   booking.book.cancelBooking(record.id);
                //   fetchAll();
                // }}
                >
                  Цуцлах
                </Button>
              </>
            )
          }
          {
            isUser && record.status === "CANCELED" && (
              <Button
                type="primary"
                size="small"
                danger
              // onClick={() => {
              //   booking.book.cancelBooking(record.id);
              //   fetchAll();
              // }}
              >
                Устгах
              </Button>
            )
          }
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Захиалга"
      extra={
        <Space>
          <Input
            placeholder="Search customer"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
          <RangePicker onChange={(dates) => setRange(dates)} />
          <Select
            value={status}
            onChange={(value) => setStatus(value)}
            style={{ width: 120 }}
          >
            <Option value="all">Бүгд</Option>
            <Option value="APPROVED">Батлагдсан</Option>
            <Option value="PENDING">Захиалсан</Option>
            <Option value="CANCELED">Цуцлагдсан</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearch("");
              setRange([]);
              setStatus("all");
              setPage(1);
            }}
          >
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={data?.results || []}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          total: data?.count,
          pageSize: 10,
          onChange: (page) => setPage(page),
        }}
      />
    </Card>
  );
};

export default Booking;
