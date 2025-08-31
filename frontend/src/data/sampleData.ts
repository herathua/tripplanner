import { Place } from '../contexts/TripContext';

export const samplePlaces: Omit<Place, 'id'>[] = [
  {
    name: 'Sigiriya Rock Fortress',
    location: 'Dambulla, Sri Lanka',
    description: 'Ancient palace and fortress complex built on top of a massive rock column. A UNESCO World Heritage site with stunning views and fascinating history.',
    category: 'attraction',
    rating: 5,
    photos: [],
    coordinates: { lat: 7.9570, lng: 80.7603 },
    cost: 30,
    duration: 4
  },
  {
    name: 'Temple of the Tooth',
    location: 'Kandy, Sri Lanka',
    description: 'Sacred Buddhist temple housing the relic of the tooth of Buddha. A beautiful example of Kandyan architecture.',
    category: 'attraction',
    rating: 4,
    photos: [],
    coordinates: { lat: 7.2935, lng: 80.6414 },
    cost: 15,
    duration: 2
  },
  {
    name: 'Galle Fort',
    location: 'Galle, Sri Lanka',
    description: 'Historic fortification built by the Portuguese in the 16th century. Features colonial architecture and stunning ocean views.',
    category: 'attraction',
    rating: 4,
    photos: [],
    coordinates: { lat: 6.0535, lng: 80.2210 },
    cost: 0,
    duration: 3
  },
  {
    name: 'Colombo City Center',
    location: 'Colombo, Sri Lanka',
    description: 'Modern shopping and entertainment complex in the heart of Colombo. Features international brands and local boutiques.',
    category: 'shopping',
    rating: 4,
    photos: [],
    coordinates: { lat: 6.9271, lng: 79.8612 },
    cost: 0,
    duration: 2
  },
  {
    name: 'Mount Lavinia Hotel',
    location: 'Mount Lavinia, Sri Lanka',
    description: 'Historic beachfront hotel with colonial architecture and stunning ocean views. Perfect for a luxury stay.',
    category: 'hotel',
    rating: 5,
    photos: [],
    coordinates: { lat: 6.8394, lng: 79.8631 },
    cost: 150,
    duration: 24
  }
];
