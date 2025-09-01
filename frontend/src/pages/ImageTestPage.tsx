import React, { useState } from 'react';
import CardImageService from '../utils/cardImageService';

const ImageTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testImages = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all([
        CardImageService.getTripCardImage('Tokyo', 'city'),
        CardImageService.getTripCardImage('Paris', 'culture'),
        CardImageService.getTripCardImage('Bali', 'beach'),
        CardImageService.getGuideCardImage('Rome', 'culture'),
        CardImageService.getGuideCardImage('Thailand', 'food'),
        CardImageService.getSeasonalImage('Kyoto'),
      ]);

      setTestResults({
        tokyo: results[0],
        paris: results[1],
        bali: results[2],
        rome: results[3],
        thailand: results[4],
        kyoto: results[5],
      });
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🖼️ Dynamic Image Service Test
        </h1>
        
        <div className="mb-8">
          <button
            onClick={testImages}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Loading Images...' : 'Test Dynamic Images'}
          </button>
        </div>

        {testResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tokyo */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={testResults.tokyo.url}
                  alt={testResults.tokyo.alt}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {testResults.tokyo.credit}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Tokyo City Trip</h3>
                <p className="text-sm text-gray-600">{testResults.tokyo.alt}</p>
              </div>
            </div>

            {/* Paris */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={testResults.paris.url}
                  alt={testResults.paris.alt}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {testResults.paris.credit}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Paris Culture Trip</h3>
                <p className="text-sm text-gray-600">{testResults.paris.alt}</p>
              </div>
            </div>

            {/* Bali */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={testResults.bali.url}
                  alt={testResults.bali.alt}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {testResults.bali.credit}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Bali Beach Trip</h3>
                <p className="text-sm text-gray-600">{testResults.bali.alt}</p>
              </div>
            </div>

            {/* Rome Guide */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={testResults.rome.url}
                  alt={testResults.rome.alt}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {testResults.rome.credit}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Rome Culture Guide</h3>
                <p className="text-sm text-gray-600">{testResults.rome.alt}</p>
              </div>
            </div>

            {/* Thailand Guide */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={testResults.thailand.url}
                  alt={testResults.thailand.alt}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {testResults.thailand.credit}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Thailand Food Guide</h3>
                <p className="text-sm text-gray-600">{testResults.thailand.alt}</p>
              </div>
            </div>

            {/* Kyoto Seasonal */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={testResults.kyoto.url}
                  alt={testResults.kyoto.alt}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {testResults.kyoto.credit}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Kyoto Seasonal</h3>
                <p className="text-sm text-gray-600">{testResults.kyoto.alt}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            🎯 What This Demonstrates
          </h2>
          <ul className="text-blue-800 space-y-2">
            <li>✅ <strong>Dynamic Images:</strong> Each card gets a unique, relevant image</li>
            <li>✅ <strong>Destination-Specific:</strong> Tokyo gets Tokyo images, Paris gets Paris images</li>
            <li>✅ <strong>Activity-Based:</strong> Beach trips get beach images, city trips get city images</li>
            <li>✅ <strong>Guide Types:</strong> Culture guides get culture images, food guides get food images</li>
            <li>✅ <strong>Seasonal:</strong> Kyoto gets seasonal-appropriate images</li>
            <li>✅ <strong>No More Hardcoded:</strong> Every card is unique and relevant</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageTestPage;
