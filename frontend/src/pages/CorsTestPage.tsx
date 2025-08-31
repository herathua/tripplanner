import React, { useState } from 'react';
import apiClient from '../config/api';

const CorsTestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCorsGet = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/test/cors');
      setTestResult(`GET Test: ${response.data}`);
    } catch (error: any) {
      setTestResult(`GET Test Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCorsPost = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/test/cors', { message: 'Hello from frontend!' });
      setTestResult(`POST Test: ${response.data}`);
    } catch (error: any) {
      setTestResult(`POST Test Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTripsEndpoint = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/trips');
      setTestResult(`Trips Test: Found ${response.data.length} trips`);
    } catch (error: any) {
      setTestResult(`Trips Test Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSimpleTripCreation = async () => {
    setLoading(true);
    try {
      const testTripData = {
        title: "Test Trip",
        destination: "Test Destination",
        startDate: "2024-12-01",
        endDate: "2024-12-07",
        budget: 1000
      };
      const response = await apiClient.post('/test/trip-simple', testTripData);
      setTestResult(`Simple Trip Test: ${response.data}`);
    } catch (error: any) {
      setTestResult(`Simple Trip Test Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testExactTripData = async () => {
    setLoading(true);
    try {
      const exactTripData = {
        title: "Test Trip",
        destination: "Test Destination", 
        startDate: "2024-12-01",
        endDate: "2024-12-07",
        budget: 1000
      };
      console.log('Testing with exact trip data:', JSON.stringify(exactTripData, null, 2));
      const response = await apiClient.post('/trips', exactTripData);
      setTestResult(`Exact Trip Test: Success! Trip ID: ${response.data.id}`);
    } catch (error: any) {
      console.error('Exact trip test error:', error.response?.data);
      setTestResult(`Exact Trip Test Error: ${error.response?.data || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CORS Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test CORS Configuration</h2>
          
          <div className="space-y-4">
            <button
              onClick={testCorsGet}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test CORS GET
            </button>
            
            <button
              onClick={testCorsPost}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
            >
              Test CORS POST
            </button>
            
            <button
              onClick={testTripsEndpoint}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
            >
              Test Trips Endpoint
            </button>

            <button
              onClick={testSimpleTripCreation}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
            >
              Test Simple Trip Creation
            </button>

            <button
              onClick={testExactTripData}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
            >
              Test Exact Trip Data
            </button>
          </div>
          
          {testResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded border">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">CORS Configuration Summary</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Backend URL:</strong> http://localhost:8080/api</p>
            <p><strong>Frontend URL:</strong> http://localhost:5173</p>
            <p><strong>Context Path:</strong> /api</p>
            <p><strong>Allowed Origins:</strong> localhost:3000, localhost:5173, localhost:4173</p>
            <p><strong>Allowed Methods:</strong> GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD</p>
            <p><strong>Credentials:</strong> Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorsTestPage;
