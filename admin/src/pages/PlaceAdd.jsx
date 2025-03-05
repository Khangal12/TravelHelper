import React, { useState, useEffect } from "react";
import "antd/dist/reset.css"; // Make sure this is imported

import { Steps, Button, Form, Input, message, Upload } from "antd";
import {
  useMapEvents,
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import axios from "axios"; // Import axios for HTTP requests
import { useNavigate } from "react-router-dom";
import useApi from "../hook/useApi";
const { Step } = Steps;

const LocationSelector = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      setPosition([lat, lng]);
      onLocationSelect({ lat, lng });
    },
  });

  useEffect(() => {
    if (L.Control && L.Control.Geocoder) {
      const geocoder = L.Control.Geocoder.nominatim();
      const searchControl = L.Control.geocoder({
        collapsed: true,
        geocoder,
        placeholder: "Search for a place",
        defaultMarkGeocode: false,
      })
        .on("markgeocode", (e) => {
          const { lat, lng } = e.geocode.center;
          setPosition([lat, lng]);
          onLocationSelect({ lat, lng });
        })
        .addTo(map);

      return () => {
        map.removeControl(searchControl);
      };
    } else {
      console.error("Geocoder is not available");
    }
  }, [map, onLocationSelect]);

  const customIcon = L.icon({
    iconUrl: "/images/marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {position && (
        <Marker position={position} icon={customIcon}>
          <Popup>
            Latitude: {position[0]} <br /> Longitude: {position[1]}
          </Popup>
        </Marker>
      )}
    </>
  );
};

const PlaceAdd = () => {
  const navigate = useNavigate();
  const placeApi = useApi().place;

  const [currentStep, setCurrentStep] = useState(0);
  const [location, setLocation] = useState(null);
  const [placeDetails, setPlaceDetails] = useState({
    name: "",
    description: "",
  });
  const [image, setImage] = useState(null);

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlaceDetails({ ...placeDetails, [name]: value });
  };

  const handleSubmit = async () => {
    if (!placeDetails.name || !placeDetails.description) {
      message.error("Please insert name or description!");
    } else if (!location) {
      message.error("Please select a location on the map!");
    } else {
      // Create the data object to send to the backend
      const formData = new FormData();
      if (image) {
        formData.append("image", image);
      } else {
        message.error("Please insert picture!");
      }

      formData.append("title", placeDetails.name);
      formData.append("description", placeDetails.description);
      const latitude = location.lat.toFixed(6);
      const longitude = location.lng.toFixed(6);

      formData.append("latitude", latitude);
      formData.append("longitude", longitude);

      try {
        // Send a POST request to the Django API
        const data = await placeApi.post(formData);
        message.success("Place added successfully!");
        setImage(null);
        setLocation(null);
        setPlaceDetails(null);
        navigate("/places");
      } catch (error) {
        message.error("Failed to add place. Please try again.");
        console.error(error);
      }
    }
  };

  const steps = [
    {
      title: "Choose Location",
      content: (
        <div>
          <h3>Select a Location on the Map</h3>
          <MapContainer
            center={[47.5, 105.35]}
            zoom={8}
            style={{ height: "40rem", width: "100%" }}
          >
            <LocationSelector onLocationSelect={setLocation} />
          </MapContainer>
        </div>
      ),
    },
    {
      title: "Add Details",
      content: (
        <Form layout="vertical">
          <Form.Item label="Place Name" required>
            <Input
              name="name"
              value={placeDetails.name}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Description" required>
            <Input.TextArea
              name="description"
              value={placeDetails.description}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item label="Upload Image">
            <Upload
              name="image"
              showUploadList={true} // Disable the automatic file list display
              beforeUpload={(file) => {
                setImage(file); // Set the image when it's selected
                return false; // Prevent automatic upload
              }}
            >
              <Button>Click to Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <h2>Add a New Place</h2>
      <Steps current={currentStep}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} />
        ))}
      </Steps>
      <div style={{ marginTop: 20 }}>{steps[currentStep].content}</div>
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        {currentStep > 0 && <Button onClick={prev}>Previous</Button>}
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="primary" onClick={handleSubmit}>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlaceAdd;
