import React, { useEffect } from 'react';
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
  // ✅ Add debugging for coordinates
  useEffect(() => {
    console.log('🗺️ TripMap places:', places);
    places.forEach(place => {
      console.log(`📍 Place: ${place.name}`);
      console.log(`   Coordinates: lat=${place.coordinates.lat}, lng=${place.coordinates.lng}`);
      console.log(`   Type: lat=${typeof place.coordinates.lat}, lng=${typeof place.coordinates.lng}`);
    });
  }, [places]);

  // Calculate center of map based on places
  const getMapCenter = () => {
    if (places.length === 0) {
      return { lat: 7.8731, lng: 80.7718 }; // Default to Sri Lanka center
    }
    
    const lats = places.map(p => p.coordinates.lat);
    const lngs = places.map(p => p.coordinates.lng);
    
    // ✅ Validate coordinates
    const validLats = lats.filter(lat => !isNaN(lat) && lat !== null && lat !== undefined);
    const validLngs = lngs.filter(lng => !isNaN(lng) && lng !== null && lng !== undefined);
    
    if (validLats.length === 0 || validLngs.length === 0) {
      console.warn('⚠️ No valid coordinates found, using default center');
      return { lat: 7.8731, lng: 80.7718 };
    }
    
    const centerLat = (Math.min(...validLats) + Math.max(...validLats)) / 2;
    const centerLng = (Math.min(...validLngs) + Math.max(...validLngs)) / 2;
    
    console.log(`🎯 Map center: lat=${centerLat}, lng=${centerLng}`);
    return { lat: centerLat, lng: centerLng };
  };

  // Get category-specific icon
  const getCategoryIcon = (category: string) => {
    const iconSize: [number, number] = [25, 41];
    const iconAnchor: [number, number] = [12, 41];
    const popupAnchor: [number, number] = [1, -34];

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
        
        {places.map((place) => {
          // ✅ Validate coordinates before rendering
          const lat = parseFloat(place.coordinates.lat.toString());
          const lng = parseFloat(place.coordinates.lng.toString());
          
          console.log(`📍 Rendering marker for ${place.name}:`, {
            originalLat: place.coordinates.lat,
            originalLng: place.coordinates.lng,
            parsedLat: lat,
            parsedLng: lng,
            validLat: !isNaN(lat) && lat >= -90 && lat <= 90,
            validLng: !isNaN(lng) && lng >= -180 && lng <= 180
          });
          
          if (isNaN(lat) || isNaN(lng) || lat === null || lng === null) {
            console.warn(`⚠️ Invalid coordinates for place ${place.name}: lat=${lat}, lng=${lng}`);
            return null;
          }
          
          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            console.warn(`⚠️ Coordinates out of range for place ${place.name}: lat=${lat}, lng=${lng}`);
            return null;
          }
          
          return (
            <Marker
              key={place.id}
              position={[lat, lng]} // ✅ Leaflet expects [lat, lng] order
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
                  <div className="mt-1 text-xs text-gray-500">
                    📍 {lat.toFixed(6)}, {lng.toFixed(6)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TripMap;
