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
} from "antd";
import SliderPlace from "../components/Slider";
import useApi from "../hook/useApi";
import moment from "moment";
const { Step } = Steps;
const { Meta } = Card;
const { RangePicker } = DatePicker;

const TripProgram = () => {
  const placeApi = useApi().place;
  const campApi = useApi().camp;
  const [days, setDays] = useState(0);
  const [tripData, setTripData] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [places, setPlaces] = useState([]);
  const [camps, setCamps] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [tripDates, setTripDates] = useState([moment(), moment()]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const placeResponse = await placeApi.get();
        setPlaces(placeResponse);
      } catch (error) {
        console.error("Error fetching place and camp data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCamps = async () => {
      if (selectedPlace) {
        try {
          const campResponse = await campApi.getByPlaces(selectedPlace);
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

      // Ensure we are getting the correct start and end dates
      const startDate = dates[0]; // First date
      const endDate = dates[1]; // Second date

      // Calculate the number of days difference
      const diffInDays = endDate.diff(startDate, "days");

      // To ensure that the day difference includes both start and end date, add 1
      setDays(diffInDays + 1); // Add 1 to include the start date itself
    }
  };

  const handleNext = () => {
    if (currentStep < days - 1) {
      handleChangeDayDetails("day", currentStep + 1);
      setCurrentStep(currentStep + 1);
      setSelectedCamp(null);
      setSelectedPlace(null);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleChangeDayDetails = (field, value) => {
    setTripData(
      tripData.map((day, index) =>
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
    setShowModal(false);
  };

  return (
    <div>
      <Modal
        visible={showModal}
        onCancel={() => setShowModal(false)}
        onOk={handleOk}
      >
        <div style={{ marginBottom: 20 }}>
          <strong>Select Date</strong>
          <RangePicker
            value={tripDates}
            onChange={handleDateChange}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Number of Days</strong>
          <Input
            type="number"
            min={1}
            value={days}
            disabled
            onChange={(e) => handleDayChange(Number(e.target.value))}
            placeholder="Number of days"
          />
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
            <Card title={`Place to visit`} style={{ width: "100%" }}>
              <div style={{ marginBottom: 10 }}>
                <Select
                  value={selectedPlace}
                  placeholder="Select a Place"
                  allowClear
                  className="w-100"
                  onChange={handleSelectPlace}
                >
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
                    <Select.Option disabled>Select Place</Select.Option>
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
            <Card title={`Camp's / Hotel's`} style={{ width: "100%" }}>
              <div style={{ marginBottom: 10 }}>
                <Select
                  value={selectedCamp}
                  placeholder="First select a place"
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
                    <Select.Option disabled>First Select a Place</Select.Option>
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
        <Button
          type="primary"
          onClick={handlePrev}
          disabled={currentStep === 0}
          style={{ marginRight: 10 }}
        >
          Previous
        </Button>
        <Button
          type="primary"
          onClick={handleNext}
          disabled={currentStep === days - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TripProgram;
