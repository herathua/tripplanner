import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative hidden lg:block w-full h-full overflow-hidden">
      <img 
        src="https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
        alt="Travel destination - Paris" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Your Ultimate <br />
            Travel <span className="text-orange-400">Plan</span> Flights, <br />
            Hotels, <br />
            and Road Trips <br />
            with Ease, <br />
            Powered by <br />
            Google Maps
          </h2>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;