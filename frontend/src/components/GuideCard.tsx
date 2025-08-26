import React from 'react';

interface GuideCardProps {
  name: string;
  destination: string;
  image: string;
  description: string;
  onView: () => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ name, destination, image, description, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <img src={image} alt={name} className="h-32 w-full object-cover" />
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold mb-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-2">{destination}</p>
        <p className="text-sm text-gray-700 flex-1 mb-3 line-clamp-2">{description}</p>
        <button
          onClick={onView}
          className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default GuideCard;
