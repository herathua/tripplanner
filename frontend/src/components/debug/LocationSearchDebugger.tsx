import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { locationService } from '../services/locationService';

interface APITestResult {
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
}

const LocationSearchDebugger: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [testResults, setTestResults] = useState<APITestResult[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [directAPITest, setDirectAPITest] = useState<APITestResult | null>(null);

  // Test backend API
  const testBackendAPI = async (query: string) => {
    const startTime = Date.now();
    try {
      console.log('🔍 Testing backend API with query:', query);
      const response = await locationService.searchLocations(query, 'en', 5);
      const responseTime = Date.now() - startTime;
      
      console.log('📡 Backend API response:', response);
      
      const result: APITestResult = {
        success: true,
        data: response,
        responseTime
      };
      
      setTestResults(prev => [...prev, result]);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Backend API error:', error);
      
      const result: APITestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };
      
      setTestResults(prev => [...prev, result]);
      return result;
    }
  };

  // Test direct Booking.com API
  const testDirectAPI = async (query: string) => {
    const startTime = Date.now();
    try {
      console.log('🌐 Testing direct Booking.com API with query:', query);
      
      const response = await fetch(
        `https://booking-com-api5.p.rapidapi.com/accomodation/autocomplete?languagecode=en&limit=5&query=${query}&currency_code=USD`,
        {
          headers: {
            'X-Rapidapi-Key': 'bbefbd0c2cmsh32738304eae9dfap19a055jsn132ee598d744',
            'X-Rapidapi-Host': 'booking-com-api5.p.rapidapi.com'
          }
        }
      );

      const responseTime = Date.now() - startTime;
      const data = await response.json();
      
      console.log('📡 Direct API response:', data);
      
      const result: APITestResult = {
        success: response.ok,
        data: data,
        responseTime
      };
      
      setDirectAPITest(result);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Direct API error:', error);
      
      const result: APITestResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };
      
      setDirectAPITest(result);
      return result;
    }
  };

  // Run tests
  const runTests = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setIsTesting(true);
    setTestResults([]);
    setDirectAPITest(null);

    // Test both APIs
    await Promise.all([
      testBackendAPI(searchQuery),
      testDirectAPI(searchQuery)
    ]);

    setIsTesting(false);
  };

  // Test with sample queries
  const testSampleQueries = async () => {
    const sampleQueries = ['Paris', 'New York', 'Tokyo', 'London'];
    
    setIsTesting(true);
    setTestResults([]);
    setDirectAPITest(null);

    for (const query of sampleQueries) {
      console.log(`🧪 Testing sample query: ${query}`);
      await testBackendAPI(query);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between requests
    }

    setIsTesting(false);
  };

  // Clear results
  const clearResults = () => {
    setTestResults([]);
    setDirectAPITest(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔍 Location Search API Debugger
      </h2>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter location to search (e.g., Paris, New York, Tokyo)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={runTests}
          disabled={isTesting || !searchQuery.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Test APIs
            </>
          )}
        </button>

        <button
          onClick={testSampleQueries}
          disabled={isTesting}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Test Sample Queries
        </button>

        <button
          onClick={clearResults}
          disabled={isTesting}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Results
        </button>
      </div>

      {/* Direct API Test Results */}
      {directAPITest && (
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            {directAPITest.success ? (
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            )}
            Direct Booking.com API Test
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {directAPITest.success ? 'Success' : 'Failed'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Response Time:</strong> {directAPITest.responseTime}ms
              </p>
            </div>
            
            {directAPITest.error && (
              <div className="text-sm text-red-600">
                <strong>Error:</strong> {directAPITest.error}
              </div>
            )}
          </div>

          {directAPITest.data && (
            <div className="mt-3">
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">View Raw Response</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(directAPITest.data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Backend API Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Backend API Test Results</h3>
          
          {testResults.map((result, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  )}
                  Test #{index + 1}
                </h4>
                <span className="text-sm text-gray-600">
                  {result.responseTime}ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {result.success ? 'Success' : 'Failed'}
                  </p>
                  {result.error && (
                    <p className="text-sm text-red-600">
                      <strong>Error:</strong> {result.error}
                    </p>
                  )}
                </div>
                
                {result.data && (
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Results Count:</strong> {
                        result.data?.data?.data?.autoCompleteSuggestions?.results?.length || 0
                      }
                    </p>
                  </div>
                )}
              </div>

              {result.data && (
                <div className="mt-3">
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">View Raw Response</summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">How to Use:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Enter a location name in the search box</li>
          <li>2. Click "Test APIs" to test both backend and direct API</li>
          <li>3. Check the results to see if Booking.com API is working</li>
          <li>4. Use "Test Sample Queries" to test multiple locations</li>
          <li>5. Check browser console for detailed logs</li>
        </ol>
      </div>

      {/* Troubleshooting */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• If backend API fails: Check if your Spring Boot server is running</li>
          <li>• If direct API fails: Check API key and network connection</li>
          <li>• If no results: Try different location names</li>
          <li>• Check browser console for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationSearchDebugger;
