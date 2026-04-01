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

function LocationPicker({ setLocation, initialPosition, addressText }) {
  const [position, setPosition] = useState(
    initialPosition || [31.0409, 31.3785]
  );

  const markerRef = useRef(null);

  useEffect(() => {
    if (
      initialPosition &&
      (initialPosition[0] !== position[0] ||
        initialPosition[1] !== position[1])
    ) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        setPosition([lat, lng]);
        setLocation({ lat, lng });

        // افتح البوب أب فورًا
        setTimeout(() => {
          markerRef.current?.openPopup();
        }, 50);
      }
    });

    useEffect(() => {
      map.setView(position, map.getZoom());
    }, [position]);

    return (
      <Marker position={position} icon={customIcon} ref={markerRef}>
        <Popup autoPan={false} closeOnClick={false}>
          <div style={{ textAlign: "center", direction: "rtl" }}>
            
            {/* 🔥 هنا التعديل المهم */}
            {addressText && addressText.length > 3 ? (
              <>
                📍 {addressText}
              </>
            ) : (
              <>
                📍 جاري تحديد العنوان...
              </>
            )}

          </div>
        </Popup>
      </Marker>
    );
  }

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
      <LocationMarker />
    </MapContainer>
  );
}

export default LocationPicker;