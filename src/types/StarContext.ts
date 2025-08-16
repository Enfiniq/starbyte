import { ReactNode } from "react";
import { Star } from "./Star";

export interface StarContextType {
  star: Star | null;
  loading: boolean;
  setStar: React.Dispatch<React.SetStateAction<Star | null>>;
  fetchStarData: (starName: string) => Promise<void>;
  logoutStar: () => void;
}
export interface StarProviderProps {
  children: ReactNode;
}
