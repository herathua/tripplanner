import React, { useState } from 'react';
import { tripService, userService, placeService } from '../services';
import { Trip, TripStatus, TripVisibility } from '../services/tripService';
import { User, UserRole } from '../services/userService';
import { Place, PlaceCategory } from '../services/placeService';

const ApiTestPage: React.FC = () => {
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const setLoadingState = (key: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  };

  const setResult = (key: string, data: any) => {
    setResults(prev => ({ ...prev, [key]: data }));
  };

  // Trip API Tests
  const testCreateTrip = async () => {
    setLoadingState('createTrip', true);
    try {
      const newTrip: Trip = {
        title: 'Test Trip',
        destination: 'Test Destination',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        budget: 1000,
        description: 'A test trip',
        status: TripStatus.PLANNING,
        visibility: TripVisibility.PRIVATE
      };
      const result = await tripService.createTrip(newTrip);
      setResult('createTrip', result);
    } catch (error: any) {
      setResult('createTrip', { error: error.message });
    } finally {
      setLoadingState('createTrip', false);
    }
  };

  const testGetAllTrips = async () => {
    setLoadingState('getAllTrips', true);
    try {
      const result = await tripService.getAllTrips();
      setResult('getAllTrips', result);
    } catch (error: any) {
      setResult('getAllTrips', { error: error.message });
    } finally {
      setLoadingState('getAllTrips', false);
    }
  };

  const testSearchTrips = async () => {
    setLoadingState('searchTrips', true);
    try {
      const result = await tripService.searchTrips('test');
      setResult('searchTrips', result);
    } catch (error: any) {
      setResult('searchTrips', { error: error.message });
    } finally {
      setLoadingState('searchTrips', false);
    }
  };

  // User API Tests
  const testCreateUser = async () => {
    setLoadingState('createUser', true);
    try {
      const newUser: User = {
        email: 'test@example.com',
        displayName: 'Test User',
        role: UserRole.USER,
        emailVerified: true,
        active: true
      };
      const result = await userService.createUser(newUser);
      setResult('createUser', result);
    } catch (error: any) {
      setResult('createUser', { error: error.message });
    } finally {
      setLoadingState('createUser', false);
    }
  };

  const testGetAllUsers = async () => {
    setLoadingState('getAllUsers', true);
    try {
      const result = await userService.getAllUsers();
      setResult('getAllUsers', result);
    } catch (error: any) {
      setResult('getAllUsers', { error: error.message });
    } finally {
      setLoadingState('getAllUsers', false);
    }
  };

  // Place API Tests
  const testCreatePlace = async () => {
    setLoadingState('createPlace', true);
    try {
      const newPlace: Place = {
        name: 'Test Place',
        location: 'Test Location',
        description: 'A test place',
        category: PlaceCategory.ATTRACTION,
        rating: 4.5,
        cost: 50,
        duration: 2
      };
      const result = await placeService.createPlace(newPlace);
      setResult('createPlace', result);
    } catch (error: any) {
      setResult('createPlace', { error: error.message });
    } finally {
      setLoadingState('createPlace', false);
    }
  };

  const testGetAllPlaces = async () => {
    setLoadingState('getAllPlaces', true);
    try {
      const result = await placeService.getAllPlaces();
      setResult('getAllPlaces', result);
    } catch (error: any) {
      setResult('getAllPlaces', { error: error.message });
    } finally {
      setLoadingState('getAllPlaces', false);
    }
  };

  const testSearchPlaces = async () => {
    setLoadingState('searchPlaces', true);
    try {
      const result = await placeService.searchPlaces('test');
      setResult('searchPlaces', result);
    } catch (error: any) {
      setResult('searchPlaces', { error: error.message });
    } finally {
      setLoadingState('searchPlaces', false);
    }
  };

  const testGetPlacesByCategory = async () => {
    setLoadingState('getPlacesByCategory', true);
    try {
      const result = await placeService.getPlacesByCategory(PlaceCategory.ATTRACTION);
      setResult('getPlacesByCategory', result);
    } catch (error: any) {
      setResult('getPlacesByCategory', { error: error.message });
    } finally {
      setLoadingState('getPlacesByCategory', false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip API Tests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Trip API</h2>
            
            <div className="space-y-3">
              <button
                onClick={testCreateTrip}
                disabled={loading['createTrip']}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading['createTrip'] ? 'Creating...' : 'Create Trip'}
              </button>
              
              <button
                onClick={testGetAllTrips}
                disabled={loading['getAllTrips']}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading['getAllTrips'] ? 'Loading...' : 'Get All Trips'}
              </button>
              
              <button
                onClick={testSearchTrips}
                disabled={loading['searchTrips']}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading['searchTrips'] ? 'Searching...' : 'Search Trips'}
              </button>
            </div>

            {results['createTrip'] && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Create Trip Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(results['createTrip'], null, 2)}
                </pre>
              </div>
            )}

            {results['getAllTrips'] && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">All Trips Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(results['getAllTrips'], null, 2)}
                </pre>
              </div>
            )}

            {results['searchTrips'] && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Search Trips Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(results['searchTrips'], null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* User API Tests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">User API</h2>
            
            <div className="space-y-3">
              <button
                onClick={testCreateUser}
                disabled={loading['createUser']}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading['createUser'] ? 'Creating...' : 'Create User'}
              </button>
              
              <button
                onClick={testGetAllUsers}
                disabled={loading['getAllUsers']}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading['getAllUsers'] ? 'Loading...' : 'Get All Users'}
              </button>
            </div>

            {results['createUser'] && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Create User Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(results['createUser'], null, 2)}
                </pre>
              </div>
            )}

            {results['getAllUsers'] && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">All Users Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(results['getAllUsers'], null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Place API Tests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">Place API</h2>
            
            <div className="space-y-3">
              <button
                onClick={testCreatePlace}
                disabled={loading['createPlace']}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading['createPlace'] ? 'Creating...' : 'Create Place'}
              </button>
              
              <button
                onClick={testGetAllPlaces}
                disabled={loading['getAllPlaces']}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading['getAllPlaces'] ? 'Loading...' : 'Get All Places'}
              </button>
              
              <button
                onClick={testSearchPlaces}
                disabled={loading['searchPlaces']}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading['searchPlaces'] ? 'Searching...' : 'Search Places'}
              </button>
              
              <button
                onClick={testGetPlacesByCategory}
                disabled={loading['getPlacesByCategory']}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading['getPlacesByCategory'] ? 'Loading...' : 'Get Places by Category'}
              </button>
            </div>

            {results['createPlace'] && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Create Place Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(results['createPlace'], null, 2)}
                </pre>
              </div>
            )}

            {results['getAllPlaces'] && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">All Places Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(results['getAllPlaces'], null, 2)}
                </pre>
              </div>
            )}

            {results['searchPlaces'] && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Search Places Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(results['searchPlaces'], null, 2)}
                </pre>
              </div>
            )}

            {results['getPlacesByCategory'] && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Places by Category Result:</h3>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(results['getPlacesByCategory'], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Connection Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API Connection Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Frontend URL:</strong> {window.location.origin}
            </div>
            <div>
              <strong>Backend URL:</strong> http://localhost:8080
            </div>
            <div>
              <strong>Environment:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}
            </div>
            <div>
              <strong>Proxy Enabled:</strong> No
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
