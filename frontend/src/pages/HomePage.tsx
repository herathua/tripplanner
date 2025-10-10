import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import GuideCard from '../components/GuideCard';
import TripCreationModal from '../components/modals/TripCreationModal';
import { tripService } from '../services/tripService';
import { blogService, BlogPost } from '../services/blogService';
import CardImageService from '../utils/cardImageService';
import { useUserProfile } from '../hooks/useUserProfile';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic Trip Card Component
  const DynamicTripCard: React.FC<{ trip: any }> = ({ trip }) => {
    const [imageData, setImageData] = useState<{
      url: string;
      alt: string;
      credit: string;
    } | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(true);

    useEffect(() => {
      const loadImage = async () => {
        try {
          setIsImageLoading(true);
          // Use destination from trip or fallback to title
          const destination = trip.destination || trip.title || 'Travel';
          const image = await CardImageService.getTripCardImage(destination);
          setImageData(image);
        } catch (error) {
          console.error('Failed to load trip image:', error);
          // Fallback to default image
          setImageData({
            url: '/src/assets/logo.png',
            alt: 'Travel destination',
            credit: 'Default image'
          });
        } finally {
          setIsImageLoading(false);
        }
      };

      loadImage();
    }, [trip.destination, trip.title]);

    return (
      <div className="overflow-hidden border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 glass-card">
        <div className="relative">
          {isImageLoading ? (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <img
              src={imageData?.url || '/src/assets/logo.png'}
              alt={imageData?.alt || trip.title}
              className="object-cover w-full h-48"
            />
          )}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs rounded-full ${
              trip.status === 'ACTIVE' ? 'bg-teal-100 text-teal-800' :
              trip.status === 'PLANNING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {trip.status || 'PLANNING'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <div 
            className="cursor-pointer mb-3"
            onClick={() => handleViewTrip(trip)}
          >
            <h3 className="mb-2 font-semibold text-lg hover:text-[#029E9D] transition-colors">{trip.title || 'Untitled Trip'}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <span className="font-medium">{trip.destination || 'Unknown Destination'}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'TBD'} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'TBD'}</span>
              {trip.budget && (
                <span className="font-medium text-[#029E9D]">
                  ${trip.budget.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          {/* Trip action buttons */}
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditTrip(trip);
              }}
              className="flex-1 bg-[#029E9D] text-white px-3 py-1.5 rounded text-sm hover:bg-[#027a7a] flex items-center justify-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTrip(trip.id);
              }}
              className="flex-1 bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const user = useAppSelector((state) => state.auth.user);
  const { profile } = useUserProfile(user);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [tripPage, setTripPage] = useState(0);
  const [tripTotalPages, setTripTotalPages] = useState(1);
  const [tripsLoading, setTripsLoading] = useState(false);
  const tripsPerPage = 3;
  
  // User guides state
  const [userGuides, setUserGuides] = useState<BlogPost[]>([]);
  const [publishedGuides, setPublishedGuides] = useState<BlogPost[]>([]);
  const [guidePage, setGuidePage] = useState(0);
  const [guideTotalPages, setGuideTotalPages] = useState(1);
  const guidesPerPage = 3;

  // Load user trips
  useEffect(() => {
    console.log('HomePage useEffect triggered');
    console.log('User:', user);
    console.log('User UID:', user?.uid);
    
    if (user && user.uid) {
      console.log('Loading trips for user:', user.uid);
      setTripsLoading(true);
      tripService.getUpcomingAccessibleTripsByUser(user.uid, tripPage, tripsPerPage).then((data) => {
        console.log('Trips data received:', data);
        console.log('Data structure:', {
          content: data.content,
          totalPages: data.totalPages,
          page: data.page,
          size: data.size,
          totalElements: data.totalElements
        });
        setUpcomingTrips(data.content || []);
        setTripTotalPages(data.totalPages || 1);
      }).catch(error => {
        console.error('Error loading trips:', error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.message);
        setUpcomingTrips([]);
      }).finally(() => {
        setTripsLoading(false);
      });
    } else {
      console.log('No user or user.uid, skipping trip loading');
      setUpcomingTrips([]);
      setTripsLoading(false);
    }
  }, [user, tripPage]);

  // Load user guides
  useEffect(() => {
    if (user && user.uid) {
      // Load user's own guides
      blogService.getUserBlogPosts(user.uid, guidePage, guidesPerPage).then((data) => {
        setUserGuides(data.content || []);
        setGuideTotalPages(data.totalPages || 1);
      }).catch(error => {
        console.error('Error loading user guides:', error);
        setUserGuides([]);
        setGuideTotalPages(1);
      });

      // Load published guides from all users
      blogService.getPublishedBlogPosts(0, 3).then((data) => {
        setPublishedGuides(data.content || []);
      }).catch(error => {
        console.error('Error loading published guides:', error);
        setPublishedGuides([]);
      });
    }
  }, [user, guidePage]);

  const handlePlanNewTrip = () => {
    if (!user?.uid) {
      // Handle case where user is not authenticated
      console.error('User not authenticated');
      return;
    }
    setIsModalOpen(true);
  };

  // Guide management functions
  const handleEditGuide = (guide: BlogPost) => {
    navigate(`/blog/${guide.id}/edit`);
  };

  const handleDeleteGuide = async (guideId: number) => {
    if (window.confirm('Are you sure you want to delete this guide?')) {
      try {
        await blogService.deleteBlogPost(guideId, user?.uid || '');
        // Refresh guides
        if (user && user.uid) {
          const data = await blogService.getUserBlogPosts(user.uid, guidePage, guidesPerPage);
          setUserGuides(data.content || []);
        }
      } catch (error) {
        console.error('Error deleting guide:', error);
        alert('Failed to delete guide');
      }
    }
  };

  // Trip management functions
  const handleEditTrip = (trip: any) => {
    console.log('Editing trip:', trip);
    navigate(`/new-trip?tripId=${trip.id}`);
  };

  const handleViewTrip = (trip: any) => {
    console.log('Viewing trip:', trip);
    navigate(`/new-trip?tripId=${trip.id}`);
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        console.log('Deleting trip with ID:', tripId);
        await tripService.deleteTrip(tripId);
        console.log('Trip deleted successfully');
        
        // Refresh trips
        if (user && user.uid) {
          console.log('Refreshing trips after deletion...');
          const data = await tripService.getUpcomingTripsByUser(user.uid, tripPage, tripsPerPage);
          setUpcomingTrips(data.content || []);
          console.log('Trips refreshed, new count:', data.content?.length || 0);
        }
      } catch (error: any) {
        console.error('Error deleting trip:', error);
        console.error('Error details:', error.response?.data);
        alert(`Failed to delete trip: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleCreateNewGuide = () => {
    navigate('/blog/new');
  };

  const handleViewAllGuides = () => {
    navigate('/user-management?tab=guides');
  };

  const handleViewAllTrips = () => {
    navigate('/user-management?tab=trips');
  };

  return (
    <div className="min-h-screen font-body">
      {/* Main Content */}
      <main className="space-y-12">
        {/* Welcome Section */}
        <section className="text-center py-8">
          <h1 className="text-4xl font-bold text-primary mb-4 font-heading">
            Welcome back, {profile?.displayName || user?.displayName || 'Traveler'}!
          </h1>
          <p className="text-lg text-neutral-600 font-body">
            Plan your next adventure or explore travel guides
          </p>
        </section>

        {/* Upcoming Trips Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary font-heading">
              <span className="text-neutral-800">Upcoming </span>Trips
            </h2>
            <div className="flex space-x-4">
              <button
                className="glass-button text-neutral-700 px-6 py-3 rounded-xl text-sm hover:scale-105 transition-all duration-300 flex items-center font-body"
                onClick={handleViewAllTrips}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                className="bg-primary text-white px-6 py-3 rounded-xl text-sm hover:bg-primary-dark hover:scale-105 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-body"
                onClick={handlePlanNewTrip}
                disabled={!user?.uid}
              >
                <Plus className="w-4 h-4 mr-2" />
                Plan new trip
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tripsLoading ? (
              <div className="col-span-3 text-center text-neutral-500 py-12">
                <div className="glass-subtle rounded-xl p-8">
                  <div className="mb-4 text-lg font-body">Loading trips...</div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-neutral-200 rounded w-1/4 mx-auto"></div>
                  </div>
                </div>
              </div>
            ) : upcomingTrips.length === 0 ? (
              <div className="col-span-3 text-center text-neutral-500 py-12">
                <div className="glass-subtle rounded-xl p-8">
                  <div className="mb-4 text-lg font-body">
                    {user?.uid ? 'No upcoming trips found.' : 'Please log in to view your trips.'}
                  </div>
                  <small className="text-sm text-neutral-400 font-body">
                    Debug: User: {user?.uid ? 'Authenticated' : 'Not authenticated'}, 
                    Trips count: {upcomingTrips.length}
                    {user?.uid && (
                      <div className="mt-4">
                        <button 
                          onClick={() => {
                            console.log('Refreshing trips...');
                            setTripsLoading(true);
                            tripService.getUpcomingTripsByUser(user.uid, tripPage, tripsPerPage).then((data) => {
                              console.log('Refreshed trips data:', data);
                              setUpcomingTrips(data.content || []);
                              setTripTotalPages(data.totalPages || 1);
                            }).catch(error => {
                              console.error('Error refreshing trips:', error);
                            }).finally(() => {
                              setTripsLoading(false);
                            });
                          }}
                          className="text-primary hover:text-primary-dark underline font-body"
                        >
                          Refresh trips
                        </button>
                      </div>
                    )}
                  </small>
                </div>
              </div>
            ) : (
              upcomingTrips.map((trip, idx) => (
                <DynamicTripCard key={trip.id || idx} trip={trip} />
              ))
            )}
          </div>
          {/* Paging Controls */}
          {tripTotalPages > 1 && (
            <div className="flex justify-center mt-8">
              {tripPage > 0 && (
                <button
                  className="glass-button text-neutral-700 px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-body"
                  onClick={() => setTripPage(tripPage - 1)}
                >
                  Show less
                </button>
              )}
              {tripPage < tripTotalPages - 1 && (
                <button
                  className="glass-button text-neutral-700 px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-body ml-4"
                  onClick={() => setTripPage(tripPage + 1)}
                >
                  Show more
                </button>
              )}
            </div>
          )}
        </section>

        {/* Trip Creation Modal */}
        <TripCreationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />

        {/* Your Guides Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary font-heading">
              <span className="text-neutral-800">Your </span>Guides
            </h2>
            <div className="flex space-x-4">
              <button
                className="glass-button text-neutral-700 px-6 py-3 rounded-xl text-sm hover:scale-105 transition-all duration-300 flex items-center font-body"
                onClick={handleViewAllGuides}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                className="bg-primary text-white px-6 py-3 rounded-xl text-sm hover:bg-primary-dark hover:scale-105 transition-all duration-300 flex items-center font-body"
                onClick={handleCreateNewGuide}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create new guide
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {userGuides.length === 0 ? (
              <div className="col-span-3 text-center text-neutral-500 py-12">
                <div className="glass-subtle rounded-xl p-8">
                  <div className="mb-4 text-lg font-body">
                    {user?.uid ? 'No guides created yet.' : 'Please log in to view your guides.'}
                  </div>
                  <small className="text-sm text-neutral-400 font-body">
                    Debug: User: {user?.uid ? 'Authenticated' : 'Not authenticated'}, 
                    Guides count: {userGuides.length}
                    {user?.uid && (
                      <div className="mt-4">
                        <button 
                          onClick={handleCreateNewGuide}
                          className="text-primary hover:text-primary-dark underline font-body"
                        >
                          Create Your First Guide
                        </button>
                      </div>
                    )}
                  </small>
                </div>
              </div>
            ) : (
              userGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  isOwnGuide={true}
                  onEdit={handleEditGuide}
                  onDelete={handleDeleteGuide}
                />
              ))
            )}
          </div>

          {/* Paging Controls for Guides */}
          {guideTotalPages > 1 && (
            <div className="flex justify-center mt-8">
              {guidePage > 0 && (
                <button
                  className="glass-button text-neutral-700 px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-body"
                  onClick={() => setGuidePage(guidePage - 1)}
                >
                  Show less
                </button>
              )}
              {guidePage < guideTotalPages - 1 && (
                <button
                  className="glass-button text-neutral-700 px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-body ml-4"
                  onClick={() => setGuidePage(guidePage + 1)}
                >
                  Show more
                </button>
              )}
            </div>
          )}
        </section>

        {/* Published Guides Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-primary font-heading">
              <span className="text-neutral-800">Popular </span>Guides
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {publishedGuides.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-neutral-500">
                <div className="glass-subtle rounded-xl p-8">
                  <div className="text-lg font-body">No published guides available.</div>
                </div>
              </div>
            ) : (
              publishedGuides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  isOwnGuide={false}
                />
              ))
            )}
          </div>
        </section>

        
      </main>
    </div>
  );
};

export default HomePage;