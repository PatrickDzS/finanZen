import type * as Lucide from 'lucide-react';

// FIX: Changed IconName to extract only string keys to prevent type errors when used as an object index.
export type IconName = Extract<keyof Omit<typeof Lucide, 'createLucideIcon' | 'icons' | 'default' | 'createElement' | 'LucideProvider' | 'IconNode'>, string>;

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: string;
  reminderDays?: number;
  icon?: IconName;
}

export interface Investment {
  id: string;
  type: 'Renda Fixa' | 'Renda Variável' | 'Criptomoedas' | 'Fundo de Renda Fixa';
  amount: number;
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: IconName;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

export interface User {
    email: string;
    name: string;
    bio?: string;
    profilePicture?: string;
    birthDate?: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}
// Re-add Goal interface to restore the goals feature
export interface Goal {
  id: string;
  name: string;
  target: number;
  currentAmount: number;
  deadline: string;
  icon: IconName;
  color: string;
  reminderDays?: number;
}