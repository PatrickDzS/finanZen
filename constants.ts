// FIX: Import React to resolve 'Cannot find namespace 'React'' error for React.ComponentType.
import * as React from 'react';
import * as Lucide from 'lucide-react';
import type { IconName } from './types';

export const iconMap = Lucide as unknown as { [key: string]: React.ComponentType<Lucide.LucideProps> };

export const EXPENSE_CATEGORIES: { name: string; icon: IconName }[] = [
  { name: 'Moradia', icon: 'Home' },
  { name: 'Alimentação', icon: 'Utensils' },
  { name: 'Transporte', icon: 'Car' },
  { name: 'Saúde', icon: 'HeartPulse' },
  { name: 'Lazer', icon: 'Gamepad2' },
  { name: 'Educação', icon: 'BookOpen' },
  { name: 'Contas', icon: 'ReceiptText' },
  { name: 'Compras', icon: 'ShoppingCart' },
  { name: 'Outros', icon: 'Package' },
];

export const SELECTABLE_ICONS: IconName[] = [
  'Home', 'Utensils', 'Car', 'HeartPulse', 'Gamepad2', 'BookOpen', 'ReceiptText', 'ShoppingCart',
  'Plane', 'Gift', 'Shirt', 'PawPrint', 'Music', 'Film', 'Clapperboard', 'Tv', 'Droplets', 'GraduationCap', 'Landmark', 'Package'
];

// Re-add goal constants to restore the goals feature
export const GOAL_SUGGESTIONS: { name: string; icon: IconName; bgColor: string }[] = [
    { name: 'Reserva de Emergência', icon: 'ShieldCheck', bgColor: 'bg-blue-500' },
    { name: 'Viagem dos Sonhos', icon: 'Plane', bgColor: 'bg-cyan-500' },
    { name: 'Carro Novo', icon: 'Car', bgColor: 'bg-red-500' },
    { name: 'Casa Própria', icon: 'Home', bgColor: 'bg-green-500' },
    { name: 'Aposentadoria', icon: 'Landmark', bgColor: 'bg-purple-500' },
];

export const SELECTABLE_GOAL_ICONS: IconName[] = [
    'ShieldCheck', 'Plane', 'Car', 'Home', 'Landmark', 'GraduationCap', 'Gift', 'Heart', 'Camera', 'ShoppingCart', 'Package'
];

export const SELECTABLE_GOAL_COLORS: string[] = [
    'bg-blue-500', 'bg-green-500', 'bg-indigo-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-cyan-500', 'bg-teal-500'
];