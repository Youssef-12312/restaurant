import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MANSOURA_BOUNDS = [
  [31.0100, 31.3300],
  [31.0700, 31.4100]
];

function LocationMarker({ position, setPosition, setLocation, addressText, markerRef }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      setPosition([lat, lng]);
      setLocation({ lat, lng });
      setTimeout(() => markerRef.current?.openPopup(), 50);
    }
  });

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [map, position]);

  return (
    <Marker position={position} icon={customIcon} ref={markerRef}>
      <Popup autoPan={false} closeOnClick={false}>
        <div style={{ textAlign: "center", direction: "rtl" }}>
          {addressText && addressText.length > 3 ? `📍 ${addressText}` : "📍 جاري تحديد العنوان..."}
        </div>
      </Popup>
    </Marker>
  );
}

function LocationPicker({ setLocation, initialPosition, addressText }) {
  const [position, setPosition] = useState(
    initialPosition || [31.0409, 31.3785]
  );

  const markerRef = useRef(null);

  useEffect(() => {
    if (!initialPosition) return undefined;

    const frame = requestAnimationFrame(() => {
      setPosition(initialPosition);
    });

    return () => cancelAnimationFrame(frame);
  }, [initialPosition]);

  return (
    <MapContainer
      center={position}
      zoom={15}
      minZoom={13}
      maxBounds={MANSOURA_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ height: "300px", width: "100%", borderRadius: "10px"}}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker
        position={position}
        setPosition={setPosition}
        setLocation={setLocation}
        addressText={addressText}
        markerRef={markerRef}
      />
    </MapContainer>
  );
}

export default LocationPicker;