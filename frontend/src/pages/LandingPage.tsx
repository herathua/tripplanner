import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  Globe, 
  ArrowRight, 
  Heart,
  Camera,
  BookOpen,
  Shield,
  Zap,
  CheckCircle,
  Sparkles,
  Target,
  DollarSign
} from 'lucide-react';
import TravelCarousel from '../components/TravelCarousel';
import logo from '../assets/logo.png';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="relative">
                  <img src={logo} alt="TripPlanner Logo" className="w-12 h-12 transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TripPlanner
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105">How It Works</a>
                <a href="#about" className="text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105">About</a>
              </div>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Travel Carousel */}
      <section className="relative min-h-screen overflow-hidden">
        <TravelCarousel />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Choose
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TripPlanner?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our platform combines cutting-edge technology with human expertise to create the ultimate travel planning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Travel Assistant */}
            <div className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Travel Assistant</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get personalized travel recommendations, weather updates, and local insights powered by advanced AI. 
                Your intelligent travel companion that learns your preferences.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                  Smart destination recommendations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                  Real-time weather forecasts
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                  Local culture insights
                </li>
              </ul>
            </div>

            {/* Smart Trip Planning */}
            <div className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Trip Planning</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create detailed itineraries with our intuitive planning tools. 
                Budget tracking, date management, and collaborative planning for groups.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-purple-500 mr-3" />
                  Interactive itinerary builder
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-purple-500 mr-3" />
                  Advanced budget management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-purple-500 mr-3" />
                  Group collaboration tools
                </li>
              </ul>
            </div>

            {/* Travel Guides */}
            <div className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert Travel Guides</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Access comprehensive guides written by experienced travelers and local experts. 
                Discover hidden gems and authentic experiences.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Local expert insights
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Off-the-beaten-path spots
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  Cultural context & tips
                </li>
              </ul>
            </div>

            {/* Dynamic Images */}
            <div className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Beautiful Visuals</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Stunning destination images that automatically update based on your content. 
                Professional photography from Unsplash integration.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-orange-500 mr-3" />
                  High-quality destination photos
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-orange-500 mr-3" />
                  Smart image matching
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-orange-500 mr-3" />
                  Professional travel imagery
                </li>
              </ul>
            </div>

            {/* Community */}
            <div className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Travel Community</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Connect with fellow travelers, share experiences, and discover new destinations 
                through our vibrant global community.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-pink-500 mr-3" />
                  Share travel stories
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-pink-500 mr-3" />
                  Connect with travelers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-pink-500 mr-3" />
                  Discover new destinations
                </li>
              </ul>
            </div>

            {/* Security */}
            <div className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Reliable</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Your travel data is safe with enterprise-grade security. 
                Encrypted storage, privacy protection, and reliable backup systems.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-indigo-500 mr-3" />
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-indigo-500 mr-3" />
                  Privacy protection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-indigo-500 mr-3" />
                  Automatic backups
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TripPlanner Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get started in minutes with our simple 4-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Destination</h3>
              <p className="text-gray-600">Pick from thousands of destinations worldwide or let AI suggest the perfect spot for you.</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Plan Itinerary</h3>
              <p className="text-gray-600">Use our smart tools to create detailed day-by-day plans with activities and attractions.</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Manage Budget</h3>
              <p className="text-gray-600">Track expenses, set spending limits, and get cost-saving recommendations.</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white">4</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <Plane className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Travel & Share</h3>
              <p className="text-gray-600">Enjoy your trip and share experiences with the community. Get real-time updates and tips.</p>
            </div>
          </div>
        </div>
      </section>



      {/* About Section */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
                About
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TripPlanner
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                TripPlanner is more than just a travel planning app – it's your personal travel companion 
                that combines the power of artificial intelligence with human expertise to create unforgettable journeys.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Founded by passionate travelers, we understand the challenges of planning the perfect trip. 
                That's why we've built a platform that makes travel planning effortless, enjoyable, and accessible to everyone.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Made with Love</h3>
                    <p className="text-gray-600">Built by travelers, for travelers. We understand your needs and desires.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Coverage</h3>
                    <p className="text-gray-600">Plan trips to any destination worldwide with confidence and local expertise.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Always Evolving</h3>
                    <p className="text-gray-600">Continuous updates and new features based on user feedback and travel trends.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl p-8 text-white transform hover:scale-105 transition-transform duration-300">
                    <Plane className="w-10 h-10 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Smart Planning</h3>
                    <p className="text-sm opacity-90">AI-powered recommendations and intelligent itinerary building</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl p-8 text-white transform hover:scale-105 transition-transform duration-300">
                    <MapPin className="w-10 h-10 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Global Destinations</h3>
                    <p className="text-sm opacity-90">Comprehensive coverage of worldwide locations</p>
                  </div>
                </div>
                <div className="space-y-6 mt-12">
                  <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl p-8 text-white transform hover:scale-105 transition-transform duration-300">
                    <Users className="w-10 h-10 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Community</h3>
                    <p className="text-sm opacity-90">Connect with fellow travelers worldwide</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 text-white transform hover:scale-105 transition-transform duration-300">
                    <BookOpen className="w-10 h-10 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Expert Guides</h3>
                    <p className="text-sm opacity-90">Local insights and cultural knowledge</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Start Your
            <span className="block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              Adventure?
            </span>
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of travelers who are already planning their dream trips with TripPlanner. 
            Start creating your perfect itinerary today!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="group bg-white text-blue-600 px-12 py-5 rounded-2xl text-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:scale-105 hover:-translate-y-2"
            >
              <span className="flex items-center">
                Get Started Free
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </button>
            <button
              onClick={handleLearnMore}
              className="border-2 border-white text-white px-12 py-5 rounded-2xl text-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 backdrop-blur-sm"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img src={logo} alt="TripPlanner Logo" className="w-12 h-12" />
                <span className="text-2xl font-bold">TripPlanner</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Your ultimate travel planning companion. Discover destinations, create itineraries, 
                and connect with fellow travelers worldwide. Start your journey today.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 cursor-pointer group">
                  <span className="text-sm font-semibold group-hover:scale-110 transition-transform duration-300">f</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-all duration-300 cursor-pointer group">
                  <span className="text-sm font-semibold group-hover:scale-110 transition-transform duration-300">t</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-all duration-300 cursor-pointer group">
                  <span className="text-sm font-semibold group-hover:scale-110 transition-transform duration-300">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors duration-300">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors duration-300">How It Works</a></li>
                <li><a href="#about" className="hover:text-white transition-colors duration-300">About Us</a></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors duration-300">Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TripPlanner. All rights reserved. Made with ❤️ for travelers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
