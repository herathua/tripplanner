import React from 'react';
import { 
  MapPin, 
  Camera, 
  Utensils, 
  Bed, 
  Car, 
  ShoppingBag, 
  DollarSign 
} from 'lucide-react';

export const getCategoryIcon = (category: string): React.ReactElement => {
  switch (category) {
    case 'attraction': return <Camera className="w-4 h-4" />;
    case 'restaurant': return <Utensils className="w-4 h-4" />;
    case 'hotel': return <Bed className="w-4 h-4" />;
    case 'transport': return <Car className="w-4 h-4" />;
    case 'shopping': return <ShoppingBag className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

export const getExpenseCategoryIcon = (category: string): React.ReactElement => {
  switch (category) {
    case 'accommodation': return <Bed className="w-4 h-4" />;
    case 'food': return <Utensils className="w-4 h-4" />;
    case 'transport': return <Car className="w-4 h-4" />;
    case 'activities': return <Camera className="w-4 h-4" />;
    case 'shopping': return <ShoppingBag className="w-4 h-4" />;
    default: return <DollarSign className="w-4 h-4" />;
  }
};
