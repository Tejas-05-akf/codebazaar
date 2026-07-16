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
