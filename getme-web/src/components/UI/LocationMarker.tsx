import { Marker, useMapEvents } from "react-leaflet";

function LocationMarker({
  onLocationSelect,
  position,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  position: [number, number] | null;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default LocationMarker;