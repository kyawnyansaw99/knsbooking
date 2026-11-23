import { addDays, todayISO } from '../lib/time.js';
import { PHOTOS } from './photos.js';

// Rooms are exclusive (one booking at a time). `capacity` = max guests.
export const ROOMS = [
  {
    id: 'r-lagoon',
    name: 'Lagoon Deluxe King',
    view: 'Lagoon view',
    bed: 'King bed',
    size: 42,
    capacity: 2,
    rating: 4.8,
    amenities: ['Private balcony', 'Rain shower', 'Smart TV'],
    photos: [PHOTOS.lagoonRoom, PHOTOS.lagoonBath],
  },
  {
    id: 'r-river',
    name: 'Chao Phraya River Suite',
    view: 'River view',
    bed: 'King bed + lounge',
    size: 68,
    capacity: 3,
    rating: 4.9,
    amenities: ['Soaking tub', 'Living room', 'Butler service'],
    photos: [PHOTOS.riverLiving, PHOTOS.riverBath],
  },
  {
    id: 'r-villa',
    name: 'Andaman Pool Villa',
    view: 'Sea view',
    bed: 'King + sofa bed',
    size: 120,
    capacity: 4,
    rating: 5.0,
    amenities: ['Private pool', 'Outdoor bath', 'Sala deck'],
    photos: [PHOTOS.villaAerial, PHOTOS.villaBath],
  },
  {
    id: 'r-garden',
    name: 'Garden Family Residence',
    view: 'Garden view',
    bed: '2 Queen beds',
    size: 55,
    capacity: 4,
    rating: 4.7,
    amenities: ['Kids corner', 'Bathtub', 'Kitchenette'],
    photos: [PHOTOS.gardenHouse, PHOTOS.gardenBath],
  },
  {
    id: 'r-twin',
    name: 'Superior Twin',
    view: 'Courtyard view',
    bed: '2 Single beds',
    size: 34,
    capacity: 2,
    rating: 4.6,
    amenities: ['Work desk', 'Rain shower', 'Nespresso'],
    photos: [PHOTOS.twinRoom, PHOTOS.twinBath],
  },
  {
    id: 'r-penthouse',
    name: 'Sky Penthouse',
    view: 'Panoramic city view',
    bed: '2 bedrooms',
    size: 180,
    capacity: 6,
    rating: 4.9,
    amenities: ['Private terrace', 'Dining for 6', 'Bathtub with a view'],
    photos: [PHOTOS.penthouseView, PHOTOS.penthouseTerrace],
  },
];

// Experiences & facilities (data key kept as `equipment` so booking logic is unchanged).
// `quantity` = how many can be booked at the same time.
export const EQUIPMENT = [
  { id: 'e-spa', name: 'Thai Massage Suite', category: 'Wellness', quantity: 3, photo: PHOTOS.spa },
  { id: 'e-cabana', name: 'Poolside Cabana', category: 'Leisure', quantity: 4, photo: PHOTOS.cabana },
  { id: 'e-boat', name: 'Longtail Boat Trip', category: 'Excursion', quantity: 2, photo: PHOTOS.boat },
  { id: 'e-dinner', name: 'Private Candlelit Dinner', category: 'Dining', quantity: 1, photo: PHOTOS.dinner },
];

let seq = 0;
function booking(resourceType, resourceId, date, start, end, title, requester, status) {
  seq += 1;
  return {
    id: `seed-${seq}`,
    resourceType,
    resourceId,
    date,
    start,
    end,
    title,
    requester,
    status,
    createdAt: new Date().toISOString(),
  };
}

// Demo bookings are generated relative to today so the dashboard always looks alive.
export function seedBookings() {
  seq = 0;
  const today = todayISO();
  const tomorrow = addDays(today, 1);
  return [
    booking('room', 'r-river', today, '09:00', '10:30', 'Early check-in', 'Aye Chan', 'approved'),
    booking('room', 'r-river', today, '14:00', '15:00', 'Anniversary setup', 'Min Thu', 'approved'),
    booking('room', 'r-lagoon', today, '10:00', '11:00', 'Day-use stay', 'Su Myat', 'approved'),
    booking('room', 'r-lagoon', today, '13:30', '14:30', 'Late check-out', 'Daniel K.', 'pending'),
    booking('room', 'r-villa', today, '11:00', '12:30', 'Honeymoon arrival', 'Ploy & Arun', 'approved'),
    booking('room', 'r-villa', today, '16:00', '17:30', 'Photo shoot', 'Studio Krabi', 'pending'),
    booking('room', 'r-twin', today, '08:30', '09:00', 'Housekeeping inspection', 'Front office', 'approved'),
    booking('room', 'r-twin', today, '15:30', '16:30', 'Day-use stay', 'Htet Aung', 'approved'),
    booking('room', 'r-penthouse', today, '12:00', '13:00', 'VIP walkthrough', 'Sales team', 'approved'),
    booking('room', 'r-garden', today, '10:30', '11:00', 'Family day pass', 'Nok Family', 'cancelled'),
    booking('room', 'r-river', tomorrow, '09:30', '11:00', 'Early check-in', 'Emma W.', 'pending'),
    booking('room', 'r-penthouse', tomorrow, '14:00', '15:00', 'Private viewing', 'Lena S.', 'approved'),
    booking('equipment', 'e-cabana', today, '11:00', '12:30', 'Honeymoon arrival', 'Ploy & Arun', 'approved'),
    booking('equipment', 'e-spa', today, '09:00', '17:00', 'Spa day package', 'Wellness desk', 'approved'),
    booking('equipment', 'e-spa', today, '13:00', '17:00', 'Couples massage', 'Min Thu', 'approved'),
    booking('equipment', 'e-dinner', today, '14:00', '15:00', 'Anniversary lunch', 'Min Thu', 'approved'),
    booking('equipment', 'e-boat', tomorrow, '09:30', '11:00', 'Island hopping', 'Emma W.', 'pending'),
  ];
}
