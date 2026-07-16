export type BusinessCategory =
  'gym' | 'restaurant' | 'salon' | 'clinic' | 'school' | 'real-estate';

export type SolutionType =
  'website' | 'crm' | 'mobile-app' | 'admin-dashboard' | 'pos' | 'booking-system';

export interface Product {
  id: string;
  title: string;
  shortDescription: string;
  businessCategory: BusinessCategory;
  solutionType: SolutionType;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  downloads: number;
  thumbnailColor: string;
  seller: { name: string; initials: string; verified: boolean };
  isNew?: boolean;
  isFeatured?: boolean;
  badge?: 'Bestseller' | 'New' | 'Hot';
}

export const products: Product[] = [
  {
    id: 'p001',
    title: 'GymPro — Complete Gym Management Website',
    shortDescription: 'Member portal, trainer scheduling, UPI payments & attendance tracking built-in.',
    businessCategory: 'gym',
    solutionType: 'website',
    price: 2499,
    originalPrice: 5999,
    rating: 4.8,
    reviews: 34,
    downloads: 128,
    thumbnailColor: 'from-orange-900/40 to-orange-950/60',
    seller: { name: 'Arjun Mehta', initials: 'AM', verified: true },
    isFeatured: true,
    badge: 'Bestseller',
  },
  {
    id: 'p002',
    title: 'IronOS — Gym Member & Trainer CRM',
    shortDescription: 'Manage members, renewals, attendance and trainer assignments from one dashboard.',
    businessCategory: 'gym',
    solutionType: 'crm',
    price: 3499,
    rating: 4.9,
    reviews: 22,
    downloads: 89,
    thumbnailColor: 'from-red-900/40 to-red-950/60',
    seller: { name: 'Priya Singh', initials: 'PS', verified: true },
    isFeatured: true,
    badge: 'Hot',
  },
  {
    id: 'p003',
    title: 'MenuFlow — Restaurant Website with Online Ordering',
    shortDescription: 'Full restaurant site with menu management, online orders, and table reservations.',
    businessCategory: 'restaurant',
    solutionType: 'website',
    price: 1999,
    originalPrice: 3999,
    rating: 4.7,
    reviews: 41,
    downloads: 203,
    thumbnailColor: 'from-yellow-900/40 to-amber-950/60',
    seller: { name: 'Rohan Desai', initials: 'RD', verified: true },
    isFeatured: true,
    badge: 'Bestseller',
  },
  {
    id: 'p004',
    title: 'TableBook — Restaurant Booking & POS System',
    shortDescription: 'Table bookings, order management, billing, and kitchen display in one system.',
    businessCategory: 'restaurant',
    solutionType: 'pos',
    price: 4999,
    rating: 4.6,
    reviews: 18,
    downloads: 67,
    thumbnailColor: 'from-amber-900/40 to-yellow-950/60',
    seller: { name: 'Sneha Kulkarni', initials: 'SK', verified: false },
    badge: 'New',
  },
  {
    id: 'p005',
    title: 'GlowDesk — Salon & Spa Booking Website',
    shortDescription: 'Appointment booking, stylist profiles, service catalog and payment collection.',
    businessCategory: 'salon',
    solutionType: 'booking-system',
    price: 1499,
    rating: 4.9,
    reviews: 58,
    downloads: 312,
    thumbnailColor: 'from-pink-900/40 to-rose-950/60',
    seller: { name: 'Meera Joshi', initials: 'MJ', verified: true },
    isFeatured: true,
    badge: 'Bestseller',
  },
  {
    id: 'p006',
    title: 'SalonPro — Salon Management CRM',
    shortDescription: 'Client history, appointment scheduling, staff management and inventory tracking.',
    businessCategory: 'salon',
    solutionType: 'crm',
    price: 2999,
    rating: 4.7,
    reviews: 29,
    downloads: 144,
    thumbnailColor: 'from-purple-900/40 to-violet-950/60',
    seller: { name: 'Kavya Nair', initials: 'KN', verified: true },
  },
  {
    id: 'p007',
    title: 'CareSync — Clinic Patient Management System',
    shortDescription: 'Patient records, appointment booking, prescription tracking and billing.',
    businessCategory: 'clinic',
    solutionType: 'crm',
    price: 5999,
    originalPrice: 9999,
    rating: 4.8,
    reviews: 16,
    downloads: 54,
    thumbnailColor: 'from-cyan-900/40 to-teal-950/60',
    seller: { name: 'Dr. Vikram Iyer', initials: 'VI', verified: true },
    isFeatured: true,
    badge: 'Hot',
  },
  {
    id: 'p008',
    title: 'LeadNest — Real Estate Website + Lead CRM',
    shortDescription: 'Property listings, virtual tours, lead capture forms and inquiry management.',
    businessCategory: 'real-estate',
    solutionType: 'website',
    price: 3999,
    rating: 4.6,
    reviews: 24,
    downloads: 98,
    thumbnailColor: 'from-green-900/40 to-emerald-950/60',
    seller: { name: 'Sanjay Gupta', initials: 'SG', verified: true },
    badge: 'New',
  },
];

export const businessCategories = [
  {
    id: 'gym',
    label: 'Gym & Fitness',
    description: 'Member management, trainer scheduling & fitness tracking',
    icon: 'Dumbbell',
    count: 7,
    color: 'from-orange-500/20 to-orange-600/5',
    borderColor: 'border-orange-500/20',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    solutionTypes: ['Website', 'Member CRM', 'Trainer App', 'Attendance System'],
  },
  {
    id: 'restaurant',
    label: 'Restaurant & Food',
    description: 'Online ordering, table booking, POS & kitchen management',
    icon: 'UtensilsCrossed',
    count: 9,
    color: 'from-yellow-500/20 to-yellow-600/5',
    borderColor: 'border-yellow-500/20',
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
    solutionTypes: ['Website', 'Ordering System', 'Table Booking', 'POS'],
  },
  {
    id: 'salon',
    label: 'Salon & Spa',
    description: 'Appointment booking, client history & staff management',
    icon: 'Scissors',
    count: 6,
    color: 'from-pink-500/20 to-pink-600/5',
    borderColor: 'border-pink-500/20',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10',
    solutionTypes: ['Website', 'Booking System', 'Client CRM', 'Inventory'],
  },
  {
    id: 'clinic',
    label: 'Clinic & Healthcare',
    description: 'Patient records, prescriptions, appointments & billing',
    icon: 'Stethoscope',
    count: 5,
    color: 'from-cyan-500/20 to-cyan-600/5',
    borderColor: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    solutionTypes: ['Website', 'Patient CRM', 'Appointment Booking', 'Prescription Tracker'],
  },
  {
    id: 'school',
    label: 'School & Coaching',
    description: 'Student management, fee collection, timetables & parent apps',
    icon: 'GraduationCap',
    count: 4,
    color: 'from-violet-500/20 to-violet-600/5',
    borderColor: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    solutionTypes: ['Website', 'Student Management', 'Fee Collection', 'Parent App'],
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    description: 'Property listings, lead capture, virtual tours & agent CRM',
    icon: 'Building2',
    count: 5,
    color: 'from-green-500/20 to-green-600/5',
    borderColor: 'border-green-500/20',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10',
    solutionTypes: ['Website', 'Lead CRM', 'Property Listings', 'Agent Dashboard'],
  },
];

export const testimonials = [
  {
    quote: "Got my salon's booking website live in 2 days. Saved at least ₹35,000 in dev costs. My clients love it.",
    author: 'Deepika Rao',
    role: 'Owner, Glam Studio Pune',
    initials: 'DR',
    business: 'Salon',
  },
  {
    quote: 'The gym CRM replaced our WhatsApp group and 3 Excel sheets. Renewals now happen automatically.',
    author: 'Rohit Sharma',
    role: 'Co-founder, IronFit Gym Mumbai',
    initials: 'RS',
    business: 'Gym',
  },
  {
    quote: "Our restaurant's online order volume went up 40% in the first month after launching the website.",
    author: 'Ankit Verma',
    role: 'Owner, Spice Garden Bangalore',
    initials: 'AV',
    business: 'Restaurant',
  },
];

export const stats = [
  { value: '500+', label: 'Solutions Available' },
  { value: '2,400+', label: 'Businesses Launched' },
  { value: '₹2.8Cr+', label: 'Saved vs Custom Dev' },
  { value: '4.8★', label: 'Average Rating' },
];

export const formatINR = (n: number): string => '₹' + n.toLocaleString('en-IN');
