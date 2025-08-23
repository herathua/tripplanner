import React from 'react';
import { Clock, Tag, ArrowRight, Plane, Bed, Car } from 'lucide-react';

const DealsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Exclusive Travel Deals
          </h1>
          <p className="text-blue-100 max-w-2xl">
            Find the best deals on flights, hotels, and vacation packages. Save big on your next adventure!
          </p>
        </div>
      </div>

      {/* Deals Categories */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Plane, title: 'Flight Deals', count: 156 },
            { icon: Bed, title: 'Hotel Deals', count: 89 },
            { icon: Car, title: 'Car Rental Deals', count: 45 }
          ].map(({ icon: Icon, title, count }, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <Icon className="w-8 h-8 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-gray-600">{count} active deals</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Deals */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Featured Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Paris Summer Package",
              image: "https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg",
              discount: 30,
              price: 899,
              originalPrice: 1299,
              expires: "3 days"
            },
            {
              title: "Bangkok Adventure",
              image: "https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg",
              discount: 25,
              price: 699,
              originalPrice: 999,
              expires: "5 days"
            },
            {
              title: "Dubai Luxury Stay",
              image: "https://images.pexels.com/photos/1534411/pexels-photo-1534411.jpeg",
              discount: 20,
              price: 1199,
              originalPrice: 1499,
              expires: "7 days"
            }
          ].map((deal, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                <img 
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                  {deal.discount}% OFF
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{deal.title}</h3>
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Expires in {deal.expires}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">${deal.price}</span>
                    <span className="text-gray-400 line-through ml-2">${deal.originalPrice}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 flex items-center">
                    View Deal <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Minute Deals */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Last Minute Deals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Weekend in Rome",
                type: "Flight + Hotel",
                discount: 40,
                price: 599,
                originalPrice: 999
              },
              {
                title: "Beach Resort Cancun",
                type: "All-Inclusive Resort",
                discount: 35,
                price: 799,
                originalPrice: 1299
              }
            ].map((deal, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="w-5 h-5 text-red-500" />
                      <span className="text-red-500 font-medium">Hot Deal!</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{deal.title}</h3>
                    <p className="text-gray-600 mb-4">{deal.type}</p>
                  </div>
                  <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    Save {deal.discount}%
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">${deal.price}</span>
                    <span className="text-gray-400 line-through ml-2">${deal.originalPrice}</span>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealsPage;