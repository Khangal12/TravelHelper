import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useApi from "../hook/useApi"; // Assuming you have a useApi hook to fetch data

// Fix for default marker icons in Leaflet (optional)
const defaultIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapComponent = (id) => {
  const { admin } = useApi(); // Use your API hook to fetch place details
  const [placesWithCoords, setPlacesWithCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to read data from localStorage
  const readFromLocalStorage = () => {
    const data = [];
    let day = 0;
    while (true) {
      const item = localStorage.getItem(`tripData_day_${day}`);
      if (!item) break;
      data.push(JSON.parse(item));
      day++;
    }
    return data;
  };

  // Fetch latitude and longitude for each place
  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await admin.place.getPlaces(placeId); // Fetch place details by ID
      return response; // Assuming the response is an array of places
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const data = readFromLocalStorage();

      const places = [];
      for (const dayData of data) {
        if (dayData.place) {
          const placeDetails = await fetchPlaceDetails(dayData.place);
          if (placeDetails && Array.isArray(placeDetails)) {
            placeDetails.forEach((place) => {
              if (place.latitude && place.longitude) {
                places.push({
                  lat: place.latitude,
                  lon: place.longitude,
                  title: place.title || "Unnamed Place", // Use the title from placeDetails or a default
                });
              }
            });
          }
        }
      }
      setPlacesWithCoords(places);
      setLoading(false);
    };

    loadData();
  }, [id]);

  const defaultCenter = [46.8625, 103.8467]; // Ulaanbaatar, Mongolia
  const defaultZoom = 6; // Zoom level to show most of Mongolia

  if (loading) {
    return <p>Loading map...</p>;
  }

  const polylinePositions = placesWithCoords.map((place) => [place.lat, place.lon]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <h2>Газрын зураг</h2>
      <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {placesWithCoords.map((place, index) => (
          <Marker
            key={index}
            position={[place.lat, place.lon]}
            icon={defaultIcon}
          >
            <Popup>
              <div>
              <strong>Өдөр {index + 1} : {place.title}</strong>
              </div>
            </Popup>
          </Marker>
        ))}
        <Polyline
          positions={polylinePositions}
          color="blue"
          weight={3}
          opacity={0.7}
        />
      </MapContainer>
    </div>
  );
};

export default MapComponent;