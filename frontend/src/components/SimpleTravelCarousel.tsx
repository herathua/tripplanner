import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TravelDestination {
  place: string;
  title: string;
  title2: string;
  description: string;
  image: string;
}

const data: TravelDestination[] = [
  {
    place: 'Switzerland Alps',
    title: 'SAINT',
    title2: 'ANTONIEN',
    description: 'Tucked away in the Switzerland Alps, Saint Antönien offers an idyllic retreat for those seeking tranquility and adventure alike. It\'s a hidden gem for backcountry skiing in winter and boasts lush trails for hiking and mountain biking during the warmer months.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center'
  },
  {
    place: 'Japan Alps',
    title: 'NANGANO',
    title2: 'PREFECTURE',
    description: 'Nagano Prefecture, set within the majestic Japan Alps, is a cultural treasure trove with its historic shrines and temples, particularly the famous Zenkō-ji. The region is also a hotspot for skiing and snowboarding, offering some of the country\'s best powder.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&crop=center'
  },
  {
    place: 'Sahara Desert - Morocco',
    title: 'MARRAKECH',
    title2: 'MEROUGA',
    description: 'The journey from the vibrant souks and palaces of Marrakech to the tranquil, starlit sands of Merzouga showcases the diverse splendor of Morocco. Camel treks and desert camps offer an unforgettable immersion into the nomadic way of life.',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop&crop=center'
  },
  {
    place: 'Sierra Nevada - USA',
    title: 'YOSEMITE',
    title2: 'NATIONAL PARK',
    description: 'Yosemite National Park is a showcase of the American wilderness, revered for its towering granite monoliths, ancient giant sequoias, and thundering waterfalls. The park offers year-round recreational activities, from rock climbing to serene valley walks.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center'
  },
  {
    place: 'Tarifa - Spain',
    title: 'LOS LANCES',
    title2: 'BEACH',
    description: 'Los Lances Beach in Tarifa is a coastal paradise known for its consistent winds, making it a world-renowned spot for kitesurfing and windsurfing. The beach\'s long, sandy shores provide ample space for relaxation and sunbathing, with a vibrant atmosphere of beach bars and cafes.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&crop=center'
  },
  {
    place: 'Cappadocia - Turkey',
    title: 'Göreme',
    title2: 'Valley',
    description: 'Göreme Valley in Cappadocia is a historical marvel set against a unique geological backdrop, where centuries of wind and water have sculpted the landscape into whimsical formations. The valley is also famous for its open-air museums, underground cities, and the enchanting experience of hot air ballooning.',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop&crop=center'
  },
];

// Fallback gradient backgrounds for each destination
const fallbackGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Switzerland Alps
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Japan Alps
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Morocco
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Yosemite
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Spain
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Turkey
];

const SimpleTravelCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentDestination = data[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Background Images */}
      <div className="absolute inset-0">
        {data.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              backgroundImage: `url(${item.image}), ${fallbackGradients[index]}`,
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center, center'
            }}
          />
        ))}
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white px-4 max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="block">
              Plan Your Dream
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adventure
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Transform your travel dreams into reality with our AI-powered trip planning platform. 
            Create personalized itineraries, discover hidden gems, and connect with fellow travelers worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => window.location.href = '/login'}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-500 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 hover:-translate-y-2"
            >
              <span className="flex items-center">
                Start Planning Now
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-500 backdrop-blur-sm hover:backdrop-blur-none"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>


      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Thumbnail Navigation - Bottom Right */}
      <div className="absolute bottom-8 right-8 z-30 flex space-x-2">
        {data.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              index === currentIndex 
                ? 'border-white scale-110' 
                : 'border-white border-opacity-30 hover:border-opacity-60'
            }`}
            style={{ 
              backgroundImage: `url(${data[index].image}), ${fallbackGradients[index]}`,
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center, center'
            }}
          >
            <div className="w-full h-full bg-cover bg-center" />
          </button>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-600 z-30">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-100 ease-linear"
          style={{ width: `${((currentIndex + 1) / data.length) * 100}%` }}
        />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTravelCarousel;
