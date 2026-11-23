// All imagery in one place so it can be swapped for the hotel's own photography.
// Source: Unsplash (free licence, hotlinked via their CDN as Unsplash requires).
// Note: Unsplash's search pages don't show a location for these photos, so the
// "Thailand" tag they were found under is not confirmed for each one.

const CDN = 'https://images.unsplash.com/photo-';

export function photoUrl(id, width = 1200) {
  return `${CDN}${id}?auto=format&fit=crop&w=${width}&q=75`;
}

export function photoSrcSet(id) {
  return [480, 800, 1200, 1800].map((w) => `${photoUrl(id, w)} ${w}w`).join(', ');
}

const p = (id, alt, credit) => ({ id, alt, credit });

export const PHOTOS = {
  hero: p('1695173849152-c506198aaf90', 'Blue swimming pool framed by lush tropical trees', 'Siamor Grey'),
  beachPool: p('1729808642655-2d7ec98b5573', 'Large swimming pool next to the beach', 'Antonio Araujo'),

  // Rooms
  lagoonRoom: p('1729606188713-814d1b7bf893', 'Bedroom with a balcony overlooking the water', 'Antonio Araujo'),
  lagoonBath: p('1728016280626-0e70d437a6a1', 'Bathroom with a freestanding tub and large window', 'charkrit'),
  riverLiving: p('1646974400439-321c4a9240b9', 'Suite living area with sofa, armchair and tall windows', 'Masato Tsuchiya'),
  riverBath: p('1646974400439-8472d58bb19e', 'Bathroom with a large bathtub next to a window', 'Masato Tsuchiya'),
  villaAerial: p('1641731014123-e8292168c994', 'Aerial view of a villa with a private pool', 'Dan Thekidzzzzz'),
  villaBath: p('1729615385477-2e5ebc2ef43d', 'Outdoor bathtub beside a tree', 'Antonio Araujo'),
  gardenHouse: p('1599576838688-8a6c11263108', 'Garden residence surrounded by green trees', 'Peter Borter'),
  gardenBath: p('1728016280936-8e8c2ef3da4e', 'Bathroom with a tub and a large window', 'charkrit'),
  twinRoom: p('1706464287882-18cf0f772f79', 'Bright white room with chairs and a potted plant', 'Martin Lysek'),
  twinBath: p('1728016280671-3c0ce314d744', 'Modern bathroom with tub and sink', 'charkrit'),
  penthouseView: p('1768853329042-b0445ee6073c', 'City skyline viewed through a window at sunset', 'Rowan Heuvel'),
  penthouseTerrace: p('1646974400433-901341048192', 'Private terrace with a view over the city', 'Masato Tsuchiya'),

  // Experiences
  spa: p('1588135862932-8ec0d62d1e6b', 'Guest in a white robe by a bright window', 'Abhishek Revis'),
  cabana: p('1520250497591-112f2f40a3f4', 'Wooden loungers beside a swimming pool', 'Sara Dubler'),
  dinner: p('1646974400435-8df39fdb67bf', 'Table set with flowers and plates', 'Masato Tsuchiya'),
  boat: p('1729606187987-60b2beb3e639', 'Wooden dock with loungers and a boat on the water', 'Antonio Araujo'),
};
