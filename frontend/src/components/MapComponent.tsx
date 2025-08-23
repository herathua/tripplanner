import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  center: [number, number];
  selectedLocation: {
    destination: {
      latitude: number;
      longitude: number;
    };
    displayInfo: {
      title: string;
      subTitle: string;
    };
  } | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ center, selectedLocation }) => {
  const mapRef = useRef<L.Map>(null);

  // Fix for default marker icon in Leaflet with React
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Fly to location when selected
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      const newCenter: [number, number] = [
        selectedLocation.destination.latitude,
        selectedLocation.destination.longitude
      ];
      mapRef.current.flyTo(newCenter, 13);
    }
  }, [selectedLocation]);

  return (
    <MapContainer
      center={center}
      zoom={selectedLocation ? 13 : 2}
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectedLocation && (
        <Marker
          position={[
            selectedLocation.destination.latitude,
            selectedLocation.destination.longitude
          ]}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{selectedLocation.displayInfo.title}</h3>
              <p className="text-sm text-gray-600">{selectedLocation.displayInfo.subTitle}</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent; 