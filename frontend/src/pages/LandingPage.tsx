import React, { useState, useEffect } from 'react';
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
import CardImageService from '../utils/cardImageService';
import logo from '../assets/logo.png';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Hero destinations for rotating images
  const heroDestinations = [
    { name: 'Santorini', type: 'island' },
    { name: 'Tokyo', type: 'city' },
    { name: 'Paris', type: 'city' },
    { name: 'Bali', type: 'island' },
    { name: 'New York', type: 'city' }
  ];

  // Load hero images on component mount
  useEffect(() => {
    const loadHeroImages = async () => {
      try {
        setIsImageLoading(true);
        const imagePromises = heroDestinations.map(async (dest) => {
          try {
            const image = await CardImageService.getTripCardImage(dest.name, dest.type);
            return image.url;
          } catch (error) {
            console.error(`Failed to load image for ${dest.name}:`, error);
            return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`;
          }
        });
        
        const images = await Promise.all(imagePromises);
        setHeroImages(images);
      } catch (error) {
        console.error('Failed to load hero images:', error);
        setHeroImages(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80']);
      } finally {
        setIsImageLoading(false);
      }
    };
    loadHeroImages();
  }, []);

  // Rotate hero images
  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-body">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-nav">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 group cursor-pointer">
                <div className="relative flex items-center">
                  <img src={logo} alt="TripPlanner Logo" className="h-14 w-auto transition-transform duration-300 group-hover:scale-110 object-contain" />
                  <div className="absolute inset-0 bg-[#029E9D] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl font-bold text-primary leading-none font-heading">
                  TripPlanner
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-neutral-600 hover:text-primary transition-all duration-300 hover:scale-105 font-body">Features</a>
                <a href="#how-it-works" className="text-neutral-600 hover:text-primary transition-all duration-300 hover:scale-105 font-body">How It Works</a>
                <a href="#about" className="text-neutral-600 hover:text-primary transition-all duration-300 hover:scale-105 font-body">About</a>
              </div>
              <button
                onClick={handleGetStarted}
                className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 font-body"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Rotating Background Images */}
        <div className="absolute inset-0">
          {isImageLoading ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 plane-loading">
              <div className="plane-loading-text flex items-center justify-center h-full text-lg text-neutral-500 font-body">
                Loading amazing destinations...
              </div>
            </div>
          ) : (
            <>
              {heroImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Beautiful travel destination ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover image-fade ${
                    index === currentImageIndex ? 'active' : ''
                  }`}
                />
              ))}
              <div className="absolute inset-0 glass-hero" />
            </>
          )}
        </div>

        {/* Floating Elements with Glass Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-4 h-4 glass-subtle rounded-full float-animation"></div>
          <div className="absolute top-40 right-20 w-6 h-6 glass-accent rounded-full float-delayed"></div>
          <div className="absolute bottom-40 left-20 w-3 h-3 glass-subtle rounded-full float-animation"></div>
          <div className="absolute bottom-20 right-10 w-5 h-5 glass-accent rounded-full float-delayed"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight font-heading">
            <span className="block">
              Plan Your Dream
            </span>
            <span className="block text-primary">
              Adventure
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-10 text-gray-200 max-w-4xl mx-auto leading-relaxed font-body">
            Transform your travel dreams into reality with our AI-powered trip planning platform. 
            Create personalized itineraries, discover hidden gems, and connect with fellow travelers worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="group bg-primary text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-primary-dark transition-all duration-500 shadow-2xl hover:shadow-primary/25 transform hover:scale-105 hover:-translate-y-2 cinematic-hover font-body"
            >
              <span className="flex items-center">
                Start Planning Now
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </button>
            <button
              onClick={handleLearnMore}
              className="glass-button border-2 border-white text-white px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-white hover:text-neutral-800 transition-all duration-500 cinematic-hover font-body"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Scroll Indicator with Glass Effect */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 glass-subtle border border-white/30 rounded-full flex justify-center pulse-ring">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
              Why Choose
              <span className="block text-primary">
                TripPlanner?
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-body">
              Our platform combines cutting-edge technology with human expertise to create the ultimate travel planning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Travel Assistant */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-neutral-200 cinematic-hover">
              <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-4 font-heading">AI Travel Assistant</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed font-body">
                Get personalized travel recommendations, weather updates, and local insights powered by advanced AI. 
                Your intelligent travel companion that learns your preferences.
              </p>
              <ul className="space-y-3 text-sm text-neutral-600 font-body">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  Smart destination recommendations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  Real-time weather forecasts
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  Local culture insights
                </li>
              </ul>
            </div>

            {/* Smart Trip Planning */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-neutral-200 cinematic-hover">
              <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-4 font-heading">Smart Trip Planning</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed font-body">
                Create detailed itineraries with our intuitive planning tools. 
                Budget tracking, date management, and collaborative planning for groups.
              </p>
              <ul className="space-y-3 text-sm text-neutral-600 font-body">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3" />
                  Interactive itinerary builder
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3" />
                  Advanced budget management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3" />
                  Group collaboration tools
                </li>
              </ul>
            </div>

            {/* Travel Guides */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-neutral-200 cinematic-hover">
              <div className="w-20 h-20 bg-tertiary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-4 font-heading">Expert Travel Guides</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed font-body">
                Access comprehensive guides written by experienced travelers and local experts. 
                Discover hidden gems and authentic experiences.
              </p>
              <ul className="space-y-3 text-sm text-neutral-600 font-body">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-tertiary mr-3" />
                  Local expert insights
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-tertiary mr-3" />
                  Off-the-beaten-path spots
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-tertiary mr-3" />
                  Cultural context & tips
                </li>
              </ul>
            </div>

            {/* Beautiful Visuals */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-neutral-200 cinematic-hover">
              <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-4 font-heading">Beautiful Visuals</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed font-body">
                Stunning destination images that automatically update based on your content. 
                Professional photography from Unsplash integration.
              </p>
              <ul className="space-y-3 text-sm text-neutral-600 font-body">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  High-quality destination photos
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  Smart image matching
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  Professional travel imagery
                </li>
              </ul>
            </div>

            {/* Travel Community */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-neutral-200 cinematic-hover">
              <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-4 font-heading">Travel Community</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed font-body">
                Connect with fellow travelers, share experiences, and discover new destinations 
                through our vibrant global community.
              </p>
              <ul className="space-y-3 text-sm text-neutral-600 font-body">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3" />
                  Share travel stories
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3" />
                  Connect with travelers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3" />
                  Discover new destinations
                </li>
              </ul>
            </div>

            {/* Security */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-neutral-200 cinematic-hover">
              <div className="w-20 h-20 bg-tertiary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-4 font-heading">Secure & Reliable</h3>
              <p className="text-neutral-600 mb-6 leading-relaxed font-body">
                Your travel data is safe with enterprise-grade security. 
                Encrypted storage, privacy protection, and reliable backup systems.
              </p>
              <ul className="space-y-3 text-sm text-neutral-600 font-body">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-tertiary mr-3" />
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-tertiary mr-3" />
                  Privacy protection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-tertiary mr-3" />
                  Automatic backups
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
              How
              <span className="block text-primary">
                TripPlanner Works
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-body">
              Get started in minutes with our simple 4-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white font-heading">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-3 font-heading">Choose Destination</h3>
              <p className="text-neutral-600 font-body">Pick from thousands of destinations worldwide or let AI suggest the perfect spot for you.</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white font-heading">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-tertiary rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-3 font-heading">Plan Itinerary</h3>
              <p className="text-neutral-600 font-body">Use our smart tools to create detailed day-by-day plans with activities and attractions.</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-tertiary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white font-heading">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-3 font-heading">Manage Budget</h3>
              <p className="text-neutral-600 font-body">Track expenses, set spending limits, and get cost-saving recommendations.</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl font-bold text-white font-heading">4</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Plane className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-3 font-heading">Travel & Share</h3>
              <p className="text-neutral-600 font-body">Enjoy your trip and share experiences with the community. Get real-time updates and tips.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 font-heading">
                About
                <span className="block text-primary">
                  TripPlanner
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-body">
                TripPlanner is more than just a travel planning app – it's your personal travel companion 
                that combines the power of artificial intelligence with human expertise to create unforgettable journeys.
              </p>
              <p className="text-base text-gray-600 mb-8 leading-relaxed font-body">
                Founded by passionate travelers, we understand the challenges of planning the perfect trip. 
                That's why we've built a platform that makes travel planning effortless, enjoyable, and accessible to everyone.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-7 h-7 text-[#029E9D]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">Made with Love</h3>
                    <p className="text-gray-600 font-body">Built by travelers, for travelers. We understand your needs and desires.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-7 h-7 text-[#029E9D]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">Global Coverage</h3>
                    <p className="text-gray-600 font-body">Plan trips to any destination worldwide with confidence and local expertise.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-7 h-7 text-[#029E9D]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">Always Evolving</h3>
                    <p className="text-gray-600 font-body">Continuous updates and new features based on user feedback and travel trends.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-primary rounded-3xl p-8 text-white transform hover:scale-105 transition-transform duration-300 cinematic-hover shadow-lg">
                    <Plane className="w-10 h-10 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 font-heading">Smart Planning</h3>
                    <p className="text-sm opacity-90 font-body">AI-powered recommendations and intelligent itinerary building</p>
                  </div>
                  <div className="bg-secondary rounded-3xl p-8 text-white transform hover:scale-105 transition-transform duration-300 cinematic-hover shadow-lg">
                    <MapPin className="w-10 h-10 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 font-heading">Global Destinations</h3>
                    <p className="text-sm opacity-90 font-body">Comprehensive coverage of worldwide locations</p>
                  </div>
                </div>
                <div className="space-y-6 mt-12">
                  <div className="bg-tertiary rounded-3xl p-8 text-white transform hover:scale-105 transition-transform duration-300 cinematic-hover shadow-lg">
                    <Users className="w-10 h-10 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 font-heading">Community</h3>
                    <p className="text-sm opacity-90 font-body">Connect with fellow travelers worldwide</p>
                  </div>
                  <div className="bg-primary rounded-3xl p-8 text-white transform hover:scale-105 transition-transform duration-300 cinematic-hover shadow-lg">
                    <BookOpen className="w-10 h-10 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 font-heading">Expert Guides</h3>
                    <p className="text-sm opacity-90 font-body">Local insights and cultural knowledge</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
            Ready to Start Your
            <span className="block text-white">
              Adventure?
            </span>
          </h2>
          <p className="text-lg text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed font-body">
            Join thousands of travelers who are already planning their dream trips with TripPlanner. 
            Start creating your perfect itinerary today!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="group bg-white text-primary px-12 py-5 rounded-2xl text-lg font-semibold hover:bg-neutral-100 transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:scale-105 hover:-translate-y-2 cinematic-hover font-body"
            >
              <span className="flex items-center">
                Get Started Free
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </button>
            <button
              onClick={handleLearnMore}
              className="glass-button border-2 border-white text-white px-12 py-5 rounded-2xl text-lg font-semibold hover:bg-white hover:text-primary transition-all duration-300 cinematic-hover font-body"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <img src={logo} alt="TripPlanner Logo" className="h-14 w-auto object-contain" />
                <span className="text-2xl font-bold leading-none font-heading">TripPlanner</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed font-body">
                Your ultimate travel planning companion. Discover destinations, create itineraries, 
                and connect with fellow travelers worldwide. Start your journey today.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 glass-subtle rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300 cursor-pointer group">
                  <span className="text-sm font-semibold group-hover:scale-110 transition-transform duration-300">f</span>
                </div>
                <div className="w-12 h-12 glass-subtle rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300 cursor-pointer group">
                  <span className="text-sm font-semibold group-hover:scale-110 transition-transform duration-300">t</span>
                </div>
                <div className="w-12 h-12 glass-subtle rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300 cursor-pointer group">
                  <span className="text-sm font-semibold group-hover:scale-110 transition-transform duration-300">in</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 font-heading">Quick Links</h4>
              <ul className="space-y-3 text-gray-400 font-body">
                <li><a href="#features" className="hover:text-white transition-colors duration-300">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors duration-300">How It Works</a></li>
                <li><a href="#about" className="hover:text-white transition-colors duration-300">About Us</a></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors duration-300">Login</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400 font-body">
            <p>&copy; 2024 TripPlanner. All rights reserved. Made with ❤️ for travelers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;