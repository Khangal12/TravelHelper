import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Button,
  Steps,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  message,
  Upload
} from "antd";

import SliderPlace from "../components/Slider";
import useApi from "../hook/useApi";
import moment from "moment";
import MapComponent from "../components/MapComponent";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import usePermissions from "../hook/usePermissions";
const { Step } = Steps;
const { Meta } = Card;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const TripProgram = () => {
  const { isUser, isSuperuser } = usePermissions()
  const navigate = useNavigate();
  const { admin } = useApi();
  const { trip } = useApi();
  const [days, setDays] = useState(0);
  const [tripData, setTripData] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [places, setPlaces] = useState([]);
  const [camps, setCamps] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [tripDates, setTripDates] = useState([null, null]);
  const [loading, setLoading] = useState(true);
  const [tripTitle, setTripTitle] = useState("");
  const [tripDescription, setTripDescription] = useState("");
  const [isModalValid, setIsModalValid] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [capacity, setCapacity] = useState(1);

  useEffect(() => {
    setIsModalValid(
      tripTitle.trim() !== "" &&
      tripDates.length === 2 &&
      tripDescription.trim() !== ""
    );
  }, [tripTitle, tripDates, tripDescription]);

  const fetchData = async (selectedPlace = null) => {
    try {
      const placeResponse = await trip.place.getPlaces(selectedPlace || 0);
      setPlaces(placeResponse.places);
    } catch (error) {
      console.error("Error fetching place and camp data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCamps = async () => {
      if (selectedPlace) {
        try {
          const campResponse = await admin.camp.getByPlaces(selectedPlace);
          setCamps(campResponse);
        } catch (error) {
          console.error("Error fetching place and camp data:", error);
        }
      }
    };
    fetchCamps();
  }, [selectedPlace]);

  const handleDayChange = (value) => {
    if (value < 1) return;
    setDays(value);
    setTripData(
      Array(value).fill({ day: "", place: "", camp: "", additional: "" })
    );
  };

  const handleDateChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setTripDates(dates);
      const startDate = dates[0];
      const endDate = dates[1];
      const diffInDays = endDate.diff(startDate, "days");
      setDays(diffInDays + 1);
    }
  };

  const handleNext = () => {
    if (!selectedPlace || !selectedCamp) {
      message.warning("Заавал амралтын газар болон аялах газар оруулна уу");
      return;
    }

    if (currentStep < days - 1) {
      const stepData = {
        place: selectedPlace,
        camp: selectedCamp,
      };
      localStorage.setItem(`tripData_day_${currentStep}`, JSON.stringify(stepData));
      fetchData(selectedPlace);
      handleChangeDayDetails("day", currentStep + 1);
      setCurrentStep(currentStep + 1);
      setSelectedCamp(null);
      setSelectedPlace(null);
    }
    else {
      const stepData = {
        place: selectedPlace,
        camp: selectedCamp,
      };
      localStorage.setItem(`tripData_day_${currentStep}`, JSON.stringify(stepData));
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStepData = JSON.parse(localStorage.getItem(`tripData_day_${currentStep - 1}`));
      if (prevStepData) {
        setSelectedPlace(prevStepData.place);
        setSelectedCamp(prevStepData.camp);
      }
      fetchData(prevStepData?.place || 0);
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    const stepData = JSON.parse(localStorage.getItem(`tripData_day_${currentStep}`));
    if (stepData) {
      setSelectedPlace(stepData.place);
      setSelectedCamp(stepData.camp);
    } else {
      setSelectedPlace(null);
      setSelectedCamp(null);
    }

    if (currentStep > 0) {
      const prevStepData = JSON.parse(localStorage.getItem(`tripData_day_${currentStep - 1}`));
      fetchData(prevStepData?.place || 0);
    } else {
      fetchData();
    }
  }, [currentStep]);

  const handleChangeDayDetails = (field, value) => {
    setTripData((prevTripData) =>
      prevTripData.map((day, index) =>
        index === currentStep ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSelectPlace = (value) => {
    setSelectedPlace(value);
    setSelectedCamp(null);
    handleChangeDayDetails("place", value);
  };

  const handleSelectCamps = (value) => {
    setSelectedCamp(value);
    handleChangeDayDetails("camp", value);
  };

  const handleSliderPlaceChange = (placeId) => {
    setSelectedPlace(placeId);
    setSelectedCamp(null);
    handleChangeDayDetails("place", placeId);
  };

  const handleSliderCampChange = (campId) => {
    setSelectedCamp(campId);
    handleChangeDayDetails("camp", campId);
  };

  const handleOk = () => {
    if (!isModalValid) {
      message.warning("Бүх талбарыг бөглөн үү");
      return;
    }
    setShowModal(false);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    try {

      const itinerary = [];
      for (let i = 0; i < days; i++) {
        const dayData = JSON.parse(localStorage.getItem(`tripData_day_${i}`));
        if (dayData) {
          itinerary.push({
            day: i + 1,
            place: dayData.place,
            camp: dayData.camp,
            additional: dayData.additional || "", // Include additional details if available
          });
        }
      }

      const formData = new FormData();
      formData.append('title', tripTitle);
      formData.append('description', tripDescription);
      formData.append('startDate', tripDates[0].format("YYYY-MM-DD"));
      formData.append('endDate', tripDates[1].format("YYYY-MM-DD"));
      formData.append('days', days);
      formData.append('itinerary', JSON.stringify(itinerary));
      if (isSuperuser) {
        formData.append('capacity', capacity);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await trip.trip.createTrip(formData);
      if (response.trip_id) {
        for (let i = 0; i < days; i++) {
          localStorage.removeItem(`tripData_day_${i}`);
        }
        message.success("Амжилттай хадгаллаа");
        navigate("/");
      } else {
        message.error("Алдаа гарлаа");
      }
    } catch (error) {
      message.error("Алдаа гарлаа");
    }
  };

  return (
    <div>
      <Modal
        open={showModal}
        onCancel={handleClose}
        onOk={handleOk}
      >
        <div style={{ marginBottom: 20 }}>
          <strong>Аялалын гарчиг</strong>
          <Input
            type="text"
            placeholder="Аялалын гарчиг"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <strong>Аялах огноо оруулна уу</strong>
          <RangePicker
            // value={tripDates}
            onChange={handleDateChange}
            style={{ width: "100%" }}
            required
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Аялалын өдрийн тоо</strong>
          <Input
            type="number"
            min={1}
            value={days}
            disabled
            onChange={(e) => handleDayChange(Number(e.target.value))}
            placeholder="Аялалын өдрийн тоо"
            required
          />
        </div>
        {
          isSuperuser && (
            <div style={{ marginBottom: 10 }}>
              <strong>Хүний тоо</strong>
              <Input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
          )
        }
        <div style={{ marginBottom: 30 }}>
          <strong>Аялалын тайлбар</strong>
          <TextArea
            rows={4}
            value={tripDescription}
            onChange={(e) => setTripDescription(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: 30, display: "flex", justifyContent: "space-between" }}>
          {/* <strong>Аялах зураг оруулна уу</strong> */}
          <Upload
            listType="picture"
            beforeUpload={(file) => {
              setImageFile(file);
              return false; // Prevent automatic upload
            }}
            accept="image/*"
            maxCount={1} // Only allow one file
            onRemove={() => setImageFile(null)}
          >
            <Button icon={<UploadOutlined />}>Зураг оруулах</Button>
          </Upload>
        </div>

      </Modal>

      <Steps
        current={currentStep}
        onChange={setCurrentStep}
        style={{ marginBottom: 20 }}
      >
        {Array.from({ length: days }).map((_, index) => (
          <Step key={index} title={`Day ${index + 1}`} />
        ))}
      </Steps>

      <div style={{ width: "100%" }}>
        <Row gutter={[64, 64]}>
          <Col span={12}>
            <Card title={`Үзэсгэлэнт газар`} style={{ width: "100%" }}>
              <div style={{ marginBottom: 10 }}>
                <Select
                  placeholder="Үзэсгэлэнт газар"
                  allowClear
                  value={selectedPlace}
                  className="w-100"
                  onChange={handleSelectPlace}
                  loading={loading}
                >
                  {loading ? (
                    <Select.Option disabled value="">
                      Уншиж байна...
                    </Select.Option>
                  ) : places.length > 0 ? (
                    places.map((place) => (
                      <Select.Option key={place.id} value={place.id}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {place.image_url && (
                            <img
                              src={place.image_url}
                              style={{ width: 30, height: 30, marginRight: 10 }}
                            />
                          )}
                          {place.title}
                          ({place.distance_km} km)
                        </div>
                      </Select.Option>
                    ))
                  ) : (
                    <Select.Option disabled value="">
                      Мэдээлэл олдсонгүй
                    </Select.Option>
                  )}
                </Select>
              </div>
              <SliderPlace
                places={places}
                onPlaceSelect={handleSliderPlaceChange}
                selectedPlace={selectedPlace}
              />
            </Card>
          </Col>

          <Col span={12}>
            <Card title={`Амралтын газар болон буудал`} style={{ width: "100%" }}>
              <div style={{ marginBottom: 10 }}>
                <Select
                  value={selectedCamp}
                  placeholder="Эхлээд газараа сонгон уу"
                  allowClear
                  className="w-100"
                  onChange={handleSelectCamps}
                >
                  {camps.length > 0 ? (
                    camps.map((camp) => (
                      <Select.Option key={camp.id} value={camp.id}>
                        {camp.image && (
                          <img
                            src={camp.image}
                            alt={camp.title}
                            style={{ width: 30, height: 30, marginRight: 10 }}
                          />
                        )}
                        {camp.name}
                      </Select.Option>
                    ))
                  ) : (
                    <Select.Option disabled>Эхлээд газараа сонгон уу</Select.Option>
                  )}
                </Select>
              </div>

              <SliderPlace
                places={camps}
                onPlaceSelect={handleSliderCampChange}
                selectedPlace={selectedCamp}
              />
            </Card>
          </Col>
        </Row>
      </div>
      <div>
        <MapComponent id={selectedPlace} />
      </div>
      <div className="mt-5">
        <Button
          type="primary"
          onClick={handlePrev}
          disabled={currentStep === 0}
          style={{ marginRight: 10 }}
        >
          Буцах
        </Button>
        {currentStep === days - 1 ? (
          <Button type="primary" onClick={handleNext}>
            Хадгалах
          </Button>
        ) : (
          <Button type="primary" onClick={handleNext}>
            Дараах
          </Button>
        )}
      </div>
    </div>
  );
};

export default TripProgram;