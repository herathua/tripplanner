import React, { useState, useEffect } from 'react';
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

interface TestPlace {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  category: string;
}

const MapPinDebugger: React.FC = () => {
  const [testPlaces, setTestPlaces] = useState<TestPlace[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Test with known coordinates
  useEffect(() => {
    const places: TestPlace[] = [
      {
        id: '1',
        name: 'Paris, France',
        location: 'Paris, France',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        category: 'city'
      },
      {
        id: '2',
        name: 'New York, USA',
        location: 'New York, USA',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        category: 'city'
      },
      {
        id: '3',
        name: 'Tokyo, Japan',
        location: 'Tokyo, Japan',
        coordinates: { lat: 35.6762, lng: 139.6503 },
        category: 'city'
      }
    ];
    
    setTestPlaces(places);
    console.log('🧪 Test places created:', places);
  }, []);

  // Calculate map center
  const getMapCenter = () => {
    if (testPlaces.length === 0) {
      return { lat: 20, lng: 0 }; // World center
    }
    
    const lats = testPlaces.map(p => p.coordinates.lat);
    const lngs = testPlaces.map(p => p.coordinates.lng);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    console.log(`🎯 Map center: lat=${centerLat}, lng=${centerLng}`);
    return { lat: centerLat, lng: centerLng };
  };

  const mapCenter = getMapCenter();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🗺️ Map Pin Debugger
      </h2>

      {/* Debug Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Debug Information:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>Test Places:</strong> {testPlaces.length}</p>
          <p><strong>Map Center:</strong> {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}</p>
          <p><strong>Map Loaded:</strong> {isMapLoaded ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="mt-3">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">View Test Places</summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(testPlaces, null, 2)}
            </pre>
          </details>
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={3}
          className="w-full h-full"
          whenCreated={() => setIsMapLoaded(true)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {testPlaces.map((place) => {
            console.log(`📍 Rendering marker for ${place.name}:`, place.coordinates);
            
            return (
              <Marker
                key={place.id}
                position={[place.coordinates.lat, place.coordinates.lng]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-lg mb-1">{place.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{place.location}</p>
                    <p className="text-xs text-gray-500">
                      Coordinates: {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">What to Check:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>Map loads:</strong> You should see a world map</li>
          <li>• <strong>Markers appear:</strong> 3 blue markers should be visible</li>
          <li>• <strong>Click markers:</strong> Popups should show place information</li>
          <li>• <strong>Check console:</strong> Look for coordinate logs</li>
        </ul>
      </div>

      {/* Troubleshooting */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">If Markers Don't Appear:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Check browser console for errors</li>
          <li>• Verify Leaflet CSS is loaded</li>
          <li>• Check if coordinates are valid numbers</li>
          <li>• Try refreshing the page</li>
        </ul>
      </div>
    </div>
  );
};

export default MapPinDebugger;
