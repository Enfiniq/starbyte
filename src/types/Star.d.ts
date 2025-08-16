export type Star = {
  id: string;
  email: string;
  starName: string;
  avatar: string | null;
  bio: string | null;
  stardust: number;
  level: number;
  displayName: string;
  totalBytesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  isPremium: boolean;
};
