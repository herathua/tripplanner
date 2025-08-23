import React from 'react';
import { Map } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <div className="bg-blue-500 rounded-lg p-2 mr-2">
        <Map size={24} className="text-white" />
      </div>
      <span className="text-blue-600 font-bold text-xl tracking-wide">TRIPTALK</span>
    </div>
  );
};

export default Logo;