import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  Globe, 
  Star, 
  ArrowRight, 
  Heart,
  Compass,
  Camera,
  BookOpen,
  Shield,
  Zap
} from 'lucide-react';
import CardImageService from '../utils/cardImageService';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Load hero image on component mount
  React.useEffect(() => {
    const loadHeroImage = async () => {
      try {
        setIsImageLoading(true);
        const image = await CardImageService.getTripCardImage('Santorini', 'island');
        setHeroImage(image.url);
      } catch (error) {
        console.error('Failed to load hero image:', error);
        setHeroImage('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
      } finally {
        setIsImageLoading(false);
      }
    };
    loadHeroImage();
  }, []);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TripPlanner
              </span>
            </div>
             <div className="hidden md:flex items-center space-x-8">
               <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Services</a>
               <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
             </div>
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {isImageLoading ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50" />
          ) : (
            <img
              src={heroImage}
              alt="Beautiful travel destinations"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Plan Your Dream
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Adventure
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Discover amazing destinations, create personalized itineraries, and connect with fellow travelers. 
            Your next unforgettable journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Planning Now
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
            <button
              onClick={handleLearnMore}
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need for
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perfect Travel
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From trip planning to local guides, we've got you covered with comprehensive travel solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Travel Assistant */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Travel Assistant</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get personalized travel recommendations, weather updates, and local insights powered by AI. 
                Your intelligent travel companion.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-blue-500 mr-2" />
                  Weather forecasts for any destination
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-blue-500 mr-2" />
                  Local attractions and hidden gems
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-blue-500 mr-2" />
                  Cultural insights and tips
                </li>
              </ul>
            </div>

            {/* Trip Planning */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Trip Planning</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create detailed itineraries with our intuitive planning tools. 
                Budget tracking, date management, and collaborative planning.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-purple-500 mr-2" />
                  Interactive itinerary builder
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-purple-500 mr-2" />
                  Budget management tools
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-purple-500 mr-2" />
                  Group collaboration features
                </li>
              </ul>
            </div>

            {/* Travel Guides */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Travel Guides</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Access comprehensive guides written by experienced travelers. 
                Local knowledge, insider tips, and authentic experiences.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-green-500 mr-2" />
                  Local expert insights
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-green-500 mr-2" />
                  Off-the-beaten-path recommendations
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-green-500 mr-2" />
                  Cultural and historical context
                </li>
              </ul>
            </div>

            {/* Dynamic Images */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Beautiful Visuals</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Stunning destination images that automatically update based on your content. 
                Professional photography from Unsplash.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-orange-500 mr-2" />
                  High-quality destination photos
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-orange-500 mr-2" />
                  Automatic image matching
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-orange-500 mr-2" />
                  Professional travel imagery
                </li>
              </ul>
            </div>

            {/* Community */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Travel Community</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Connect with fellow travelers, share experiences, and discover new destinations 
                through our vibrant community.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-pink-500 mr-2" />
                  Share travel stories
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-pink-500 mr-2" />
                  Connect with travelers
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-pink-500 mr-2" />
                  Discover new destinations
                </li>
              </ul>
            </div>

            {/* Security */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Reliable</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your travel data is safe with us. Secure cloud storage, 
                privacy protection, and reliable backup systems.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-indigo-500 mr-2" />
                  Encrypted data storage
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-indigo-500 mr-2" />
                  Privacy protection
                </li>
                <li className="flex items-center">
                  <Star className="w-4 h-4 text-indigo-500 mr-2" />
                  Automatic backups
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TripPlanner?
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're passionate about making travel planning effortless and enjoyable. 
                Our platform combines cutting-edge technology with human expertise to 
                create the ultimate travel planning experience.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Made with Love</h3>
                    <p className="text-gray-600">Built by travelers, for travelers. We understand your needs.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Coverage</h3>
                    <p className="text-gray-600">Plan trips to any destination worldwide with confidence.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Always Evolving</h3>
                    <p className="text-gray-600">Continuous updates and new features based on user feedback.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-6 text-white">
                    <Plane className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold">Smart Planning</h3>
                    <p className="text-sm opacity-90">AI-powered recommendations</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-6 text-white">
                    <MapPin className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold">Global Destinations</h3>
                    <p className="text-sm opacity-90">Worldwide coverage</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 text-white">
                    <Users className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold">Community</h3>
                    <p className="text-sm opacity-90">Connect with travelers</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white">
                    <BookOpen className="w-8 h-8 mb-3" />
                    <h3 className="font-semibold">Expert Guides</h3>
                    <p className="text-sm opacity-90">Local insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">TripPlanner</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Your ultimate travel planning companion. Discover destinations, create itineraries, 
                and connect with fellow travelers worldwide.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">t</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>

                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors">Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TripPlanner. All rights reserved. Made with ❤️ for travelers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
