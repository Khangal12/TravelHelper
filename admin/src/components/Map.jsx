import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet"; // Import the Icon class from leaflet
import "leaflet/dist/leaflet.css";

const Map = ({ lat, lng, placeName }) => {
  const position = [lat, lng]; // Use the lat and lng as position

  // Create a custom icon for the marker
  const customIcon = new Icon({
    iconUrl: "/images/location.png",
    iconSize: [32, 32], // Set the size of the marker
    iconAnchor: [16, 32], // Adjust anchor position to the bottom of the marker
    popupAnchor: [0, -32], // Adjust the popup position relative to the marker
  });

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={customIcon}>
          {" "}
          {/* Use custom icon */}
          <Popup>{placeName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
