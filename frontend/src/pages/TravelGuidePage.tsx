import React from 'react';
import { Search, MapPin, Star, ArrowRight } from 'lucide-react';

const TravelGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img 
          src="https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"
          alt="Travel destinations"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40">
          <div className="container mx-auto px-4 h-full flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-bold mb-4">
              Discover Your Next Adventure
            </h1>
            <p className="text-white/90 text-lg mb-8 max-w-2xl">
              Explore comprehensive travel guides for destinations worldwide, curated by experienced travelers.
            </p>
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Search destinations, activities, or guides..."
                className="w-full py-4 px-6 pr-12 rounded-lg text-gray-900"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Popular Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Bali, Indonesia",
              image: "https://images.pexels.com/photos/1802255/pexels-photo-1802255.jpeg",
              rating: 4.8,
              reviews: 1243
            },
            {
              name: "Santorini, Greece",
              image: "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg",
              rating: 4.9,
              reviews: 956
            },
            {
              name: "Tokyo, Japan",
              image: "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg",
              rating: 4.7,
              reviews: 1876
            }
          ].map((destination, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{destination.name}</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm">{destination.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{destination.reviews} reviews</span>
                  <button className="text-blue-600 hover:text-blue-700 flex items-center">
                    View Guide <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Guides */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Travel Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Best Time to Visit",
              "Local Cuisine Guide",
              "Hidden Gems",
              "Cultural Experiences"
            ].map((guide, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2">{guide}</h3>
                <p className="text-gray-600 text-sm mb-4">Essential tips and recommendations for your journey</p>
                <button className="text-blue-600 text-sm hover:text-blue-700 flex items-center">
                  Read More <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelGuidePage;