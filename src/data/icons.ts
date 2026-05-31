import type { LucideIcon } from 'lucide-react-native';
import {
  // Food & groceries
  ShoppingCart,
  Beef,
  Apple,
  Carrot,
  UtensilsCrossed,
  Coffee,
  Pizza,
  // Transport
  Fuel,
  Car,
  ParkingCircle,
  CarTaxiFront,
  Bus,
  Bike,
  // Home & utilities
  House,
  Home,
  Droplets,
  Zap,
  Wifi,
  Wrench,
  Sofa,
  Bed,
  // Tech & entertainment
  Smartphone,
  Tv,
  Laptop,
  Gamepad2,
  // Health & wellness
  PawPrint,
  Stethoscope,
  HeartPulse,
  Pill,
  Dumbbell,
  Trophy,
  // Education
  GraduationCap,
  School,
  BookOpen,
  // Travel & leisure
  Plane,
  Hotel,
  Palmtree,
  // Personal
  Shirt,
  Footprints,
  Gift,
  Cake,
  Gem,
  // Finance
  PiggyBank,
  TrendingUp,
  ShieldAlert,
  Shield,
  Receipt,
  CreditCard,
  Landmark,
  Wallet,
  // Work & misc
  Briefcase,
  Trees,
  SprayCan,
  // Legacy fallbacks (no se muestran en el picker, solo para resolver
  // categorías existentes con keys viejas)
  Sparkles,
  ShoppingBag,
  Baby,
  Dog,
  Music,
} from 'lucide-react-native';

// Orden curado para el picker, agrupado por dominio.
export const ICON_KEYS = [
  // Food & groceries
  'shoppingCart',
  'beef',
  'apple',
  'carrot',
  'food',
  'coffee',
  'pizza',
  // Transport
  'fuel',
  'car',
  'parking',
  'taxi',
  'bus',
  'bike',
  // Home & utilities
  'house',
  'home',
  'droplets',
  'zap',
  'wifi',
  'wrench',
  'sofa',
  'bed',
  // Tech & entertainment
  'smartphone',
  'tv',
  'laptop',
  'games',
  // Health & wellness
  'pawPrint',
  'stethoscope',
  'health',
  'pill',
  'fitness',
  'trophy',
  // Education
  'learning',
  'school',
  'books',
  // Travel & leisure
  'travel',
  'hotel',
  'palmtree',
  // Personal
  'clothes',
  'footprints',
  'gift',
  'cake',
  'gem',
  // Finance
  'piggyBank',
  'trendingUp',
  'shieldAlert',
  'shield',
  'receipt',
  'creditCard',
  'landmark',
  'wallet',
  // Work & misc
  'work',
  'trees',
  'sprayCan',
] as const;

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Food & groceries
  shoppingCart: ShoppingCart,
  beef: Beef,
  apple: Apple,
  carrot: Carrot,
  food: UtensilsCrossed,
  coffee: Coffee,
  pizza: Pizza,

  // Transport
  fuel: Fuel,
  car: Car,
  parking: ParkingCircle,
  taxi: CarTaxiFront,
  bus: Bus,
  bike: Bike,

  // Home & utilities
  house: House,
  home: Home,
  droplets: Droplets,
  zap: Zap,
  wifi: Wifi,
  wrench: Wrench,
  sofa: Sofa,
  bed: Bed,

  // Tech & entertainment
  smartphone: Smartphone,
  tv: Tv,
  laptop: Laptop,
  games: Gamepad2,

  // Health & wellness
  pawPrint: PawPrint,
  stethoscope: Stethoscope,
  health: HeartPulse,
  pill: Pill,
  fitness: Dumbbell,
  trophy: Trophy,

  // Education
  learning: GraduationCap,
  school: School,
  books: BookOpen,

  // Travel & leisure
  travel: Plane,
  hotel: Hotel,
  palmtree: Palmtree,

  // Personal
  clothes: Shirt,
  footprints: Footprints,
  gift: Gift,
  cake: Cake,
  gem: Gem,

  // Finance
  piggyBank: PiggyBank,
  trendingUp: TrendingUp,
  shieldAlert: ShieldAlert,
  shield: Shield,
  receipt: Receipt,
  creditCard: CreditCard,
  landmark: Landmark,
  wallet: Wallet,

  // Work & misc
  work: Briefcase,
  trees: Trees,
  sprayCan: SprayCan,

  // Legacy fallbacks (no aparecen en el picker, solo para que las
  // categorías ya existentes con estas keys sigan renderizando bien)
  fun: Sparkles,
  shopping: ShoppingBag,
  baby: Baby,
  pets: Dog,
  tech: Smartphone,
  music: Music,
  transport: Car,
};

export const getCategoryIcon = (key: string): LucideIcon =>
  CATEGORY_ICONS[key] ?? CATEGORY_ICONS.food!;
