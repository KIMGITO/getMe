import { useMapEvents } from "react-leaflet";

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null; // Hooks inside MapContainer must return null or a marker
}

export default MapClickHandler;