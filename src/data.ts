import { ExperienceItem } from './types';

export const ECO_EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp1',
    name: 'Setiu Wetlands Boardwalk & Mangrove Replanting',
    category: 'wetlands',
    location: 'Setiu, Terengganu',
    description: 'Walk through pristine estuary forests, identify unique flora (Nypa, Rhizophora), and actively participate in replanting mangrove saplings. Led by state-certified heritage eco-naturalists who safeguard local sea shell nurseries.',
    price: 45,
    rating: 4.9,
    reviews: 148,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=600', // estuary/mangrove representations
    ecoBadges: ['Zero Plastic', 'Mangrove Replant Match', 'Local Guide Certified', 'Low Carbon Journey'],
    vendorName: 'Yusuf bin Ibrahim (Persatuan Sahabat Setiu)',
    vendorContact: '+60 13-921 4451',
    coordinate: { lat: 5.6745, lng: 102.7148 }
  },
  {
    id: 'exp2',
    name: 'Chagar Hutang Sea Turtle Sanctuary Match',
    category: 'islands',
    location: 'Redang Island, Terengganu',
    description: 'A non-disruptive, educational visit to the island’s primary nesting ground. Watch conservation researchers audit nests, learn the safe crawl patterns of Green and Hawksbill turtles, and directly support turtle tag and release programs.',
    price: 150,
    rating: 4.85,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&q=80&w=600', // beautiful green sea turtle
    ecoBadges: ['Turtle Conservation Match', 'Limited Guest Capacity', 'Zero Emission Lights'],
    vendorName: 'Dr. Nadia & Redang Marine Park Guard Guild',
    vendorContact: '+60 19-321 8872',
    coordinate: { lat: 5.7924, lng: 103.0185 }
  },
  {
    id: 'exp3',
    name: 'Kampung Mangkuk Traditional Terrapin Feed & Hatchery',
    category: 'wetlands',
    location: 'Kampung Mangkuk, Setiu',
    description: 'Learn the difference between ocean turtles and land-based river terrapins! Support the river terrapin protection project of Setiu. Feed hatchlings, measure shells, and explore local coconut orchards.',
    price: 25,
    rating: 4.95,
    reviews: 73,
    image: 'https://images.unsplash.com/photo-1518467166-367dd630d267?auto=format&fit=crop&q=80&w=600', // river/turtle theme
    ecoBadges: ['Species Preservation Support', 'Community Led-Enterprise', 'Traditional Snack Provided'],
    vendorName: 'Abang Din (Mangkuk Wild Conservationists)',
    vendorContact: '+60 12-985 3012',
    coordinate: { lat: 5.6985, lng: 102.7314 }
  },
  {
    id: 'exp4',
    name: 'Traditional Wooden Boat Preservation Duyong Walk',
    category: 'culture',
    location: 'Duyong Island, Kuala Terengganu',
    description: 'Watch regional master boat builders craft ocean liners and elegant pinas boats out of seasoned tropical hardwood. This heritage process uses no blueprint paper or metal nails; slots are joined using hand-whittled wooden dowels.',
    price: 20,
    rating: 4.78,
    reviews: 62,
    image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&q=80&w=600', // wooden boat workshop
    ecoBadges: ['Endangered Heritage Guild', 'Family-Owned Museum', 'Walk-Only Itinerary'],
    vendorName: 'Pakcik Haji Rani (Heritage Boat Workshop)',
    vendorContact: '+60 17-911 3491',
    coordinate: { lat: 5.3371, lng: 103.1194 }
  },
  {
    id: 'exp5',
    name: 'Batik Co-op Beeswax Stencil & Organic Dyeing',
    category: 'culture',
    location: 'Kuala Ibai, Kuala Terengganu',
    description: 'Create your own Terengganu batik motif on organic bamboo fabric. Learn beeswax wax-resist chanting, prepare natural dyes boiled from local mangosteen skins and sea almonds, and support rural women batik cooperative guilds.',
    price: 35,
    rating: 4.92,
    reviews: 110,
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600', // textile colors
    ecoBadges: ['Biodegradable Organic Dyes', 'Women Empowerment Co-op', 'Slow-Fashion advocate'],
    vendorName: 'Puan Halimah (Kuala Ibai Batik Sisterhood)',
    vendorContact: '+60 14-884 0021',
    coordinate: { lat: 5.2798, lng: 103.1611 }
  },
  {
    id: 'exp6',
    name: 'Kapas Island Snorkeling & Coral Planting',
    category: 'islands',
    location: 'Kapas Island, Marang',
    description: 'Take a short, low-energy craft ride to Kapas Island. Work alongside volunteer marine biologists to place healthy coral polyps on conservation reef grids, assisting Kapas Reef Guard recover bleached local coral walls.',
    price: 95,
    rating: 4.88,
    reviews: 125,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600', // beautiful sandy shallow reef
    ecoBadges: ['Reef Restoration Practice', 'No Anchorage Certified', 'Marine Micro-Donations included'],
    vendorName: 'Captain Harun (Ocean Rangers Marine Service)',
    vendorContact: '+60 11-125 4310',
    coordinate: { lat: 5.2155, lng: 103.2685 }
  }
];

export const MICRO_VENDORS = [
  {
    id: 'mv1',
    name: "Pak Mat's Row-Your-Own Wetlands Canoe Rental",
    category: 'wetlands',
    rating: 4.9,
    snippet: "Fully carbon-neutral exploration of peaceful Setiu backwaters. No dirty boat fuel smells—just paddles and quiet birds.",
    contact: "+60 13-911 3241",
    location: "Kampung Penarik",
    service: "Non-motorized Kayak & Canoe rentals",
    priceText: "RM 20 / hour"
  },
  {
    id: 'mv2',
    name: "Kak Som's Wood-Fired Traditional Nasi Dagang Stall",
    category: 'food',
    rating: 4.96,
    snippet: "The most authentic Nasi Dagang in Penarik. Steamed over native charcoal with local sea mackerel curry in biodegradable banana sheets.",
    contact: "+60 19-945 2883",
    location: "Pantai Mangkuk Roadside",
    service: "Zero-waste local biological breakfast",
    priceText: "RM 6 per package"
  },
  {
    id: 'mv3',
    name: "Teratak Penarik Eco-Homestay Resort",
    category: 'homestay',
    rating: 4.8,
    snippet: "A masterpiece of traditional Malay architecture built completely on stilts. Uses natural passive airflow ventilation requiring no heavy mechanical cooling.",
    contact: "+60 12-921 7070",
    location: "Kampung Penarik Coastline",
    service: "Heritage Eco-designed lodging",
    priceText: "RM 160 / night"
  },
  {
    id: 'mv4',
    name: "Pok Nasir's Firefly Wetland Skiff Tour",
    category: 'wetlands',
    rating: 4.92,
    snippet: "Float gently in the dark of night down the Setiu estuary, lit only by thousands of tiny fireflies nesting in native Sago palms.",
    contact: "+60 14-556 1229",
    location: "Setiu Riverbank Jetty",
    service: "Community guided bioluminescence skiff ride",
    priceText: "RM 30 per passenger"
  },
  {
    id: 'mv5',
    name: "Abang Man's Traditional Keropok Lekor",
    category: 'food',
    rating: 4.75,
    snippet: "Fresh local herring ground with sago starch and rolled by hand daily. Boiled locally and served zero-plastic in bamboo skewers.",
    contact: "+60 17-922 4110",
    location: "Seberang Takir, Kuala Terengganu",
    service: "Cultural seafood snack makers",
    priceText: "RM 5 for 10 pieces"
  }
];
