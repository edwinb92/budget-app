import type { LucideIcon } from 'lucide-react-native';
import {
  UtensilsCrossed,
  Car,
  Sparkles,
  Home,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Plane,
  Coffee,
  Gift,
  Dumbbell,
  Briefcase,
  Baby,
  Dog,
  Smartphone,
  BookOpen,
  Music,
  Gamepad2,
  Shirt,
  Fuel,
  Wifi,
  Zap,
  Droplets,
  Tv,
} from 'lucide-react-native';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  transport: Car,
  fun: Sparkles,
  home: Home,
  health: HeartPulse,
  learning: GraduationCap,
  shopping: ShoppingBag,
  travel: Plane,
  coffee: Coffee,
  gift: Gift,
  fitness: Dumbbell,
  work: Briefcase,
  baby: Baby,
  pets: Dog,
  tech: Smartphone,
  books: BookOpen,
  music: Music,
  games: Gamepad2,
  clothes: Shirt,
  fuel: Fuel,
  wifi: Wifi,
  zap: Zap,
  droplets: Droplets,
  tv: Tv,
};

export const ICON_KEYS = Object.keys(CATEGORY_ICONS);

export const getCategoryIcon = (key: string): LucideIcon =>
  CATEGORY_ICONS[key] ?? CATEGORY_ICONS.shopping!;
