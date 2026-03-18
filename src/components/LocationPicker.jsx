import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

function LocationPicker({ setLocation }) {
  const [position, setPosition] = useState([31.0409, 31.3785]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setLocation({ lat, lng });
      }
    });

    return <Marker position={position} />;
  }

  return (
    <MapContainer center={position} zoom={15} style={{ height: "300px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}

export default LocationPicker;