import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Place {
  id: string;
  name: string;
  location: string;
  description: string;
  category: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'shopping';
  rating: number;
  photos: string[];
  coordinates: { lat: number; lng: number };
  cost: number;
  duration: number;
  dayNumber?: number;
}

interface TripMapProps {
  places: Place[];
  tripName: string;
  isFullscreen?: boolean;
}

const TripMap: React.FC<TripMapProps> = ({ places, tripName, isFullscreen = false }) => {
  // Calculate center of map based on places
  const getMapCenter = () => {
    if (places.length === 0) {
      return { lat: 7.8731, lng: 80.7718 }; // Default to Sri Lanka center
    }
    
    const lats = places.map(p => p.coordinates.lat);
    const lngs = places.map(p => p.coordinates.lng);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return { lat: centerLat, lng: centerLng };
  };

  // Get category-specific icon
  const getCategoryIcon = (category: string) => {
    const iconSize = [25, 41];
    const iconAnchor = [12, 41];
    const popupAnchor = [1, -34];
    
    let iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
    let className = '';
    
    switch (category) {
      case 'attraction':
        className = 'marker-attraction';
        break;
      case 'restaurant':
        className = 'marker-restaurant';
        break;
      case 'hotel':
        className = 'marker-hotel';
        break;
      case 'transport':
        className = 'marker-transport';
        break;
      case 'shopping':
        className = 'marker-shopping';
        break;
      default:
        className = 'marker-default';
    }
    
    return new L.Icon({
      iconUrl,
      iconSize,
      iconAnchor,
      popupAnchor,
      className
    });
  };

  const mapCenter = getMapCenter();

  return (
    <div className={`w-full ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[400px]'}`} style={{ zIndex: 10 }}>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={places.length > 0 ? 10 : 7}
        className="w-full h-full rounded-lg"
        style={{ height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.coordinates.lat, place.coordinates.lng]}
            icon={getCategoryIcon(place.category)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg mb-1">{place.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{place.location}</p>
                <p className="text-sm text-gray-700 mb-2">{place.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">${place.cost}</span>
                  <span className="text-blue-600">{place.duration}h</span>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full capitalize">
                    {place.category}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TripMap;
