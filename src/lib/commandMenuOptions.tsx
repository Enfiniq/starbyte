import {
  FaDumbbell,
  FaHome,
  FaPager,
  FaShoppingCart,
  FaSignInAlt,
  FaStar,
  FaTrophy,
} from "react-icons/fa";
import { Star } from "@/types/Star";
import { ComponentType } from "react";

interface CommandOption {
  value: string;
  label: string;
  link: string;
  shortCut: string;
  icon: ComponentType<{ size: number }>;
}

interface CommandGroup {
  Heading: string;
  Options: CommandOption[];
}

export const getCommandOptions = (
  star: Star | null,
  StarProfileIcon: ComponentType<{ size: number }>
): CommandGroup[] => {
  const options: CommandGroup[] = [
    {
      Heading: "Pages",
      Options: [
        {
          value: "home",
          label: "Home",
          link: "/home",
          shortCut: "shift h",
          icon: FaHome,
        },
      ],
    },
    {
      Heading: "Explore",
      Options: [
        {
          value: "bytes",
          label: "Bytes",
          link: "/bytes",
          shortCut: "shift b",
          icon: FaDumbbell,
        },
        {
          value: "stars",
          label: "Stars",
          link: "/stars",
          shortCut: "shift s",
          icon: FaStar,
        },
        {
          value: "marketplace",
          label: "Marketplace",
          link: "/marketplace",
          shortCut: "shift m",
          icon: FaShoppingCart,
        },
        {
          value: "leaderboard",
          label: "Leaderboard",
          link: "/leaderboard",
          shortCut: "shift d",
          icon: FaTrophy,
        },
      ],
    },
  ];

  if (star?.level) {
    options.push({
      Heading: "Star",
      Options: [
        {
          value: "me",
          label: "Your Profile",
          link: `/star/${star?.starName}`,
          shortCut: "shift u",
          icon: StarProfileIcon,
        },
      ],
    });
  } else {
    options[0].Options.unshift(
      {
        value: "landing",
        label: "Landing",
        link: "/",
        shortCut: "shift l",
        icon: FaPager,
      },
      {
        value: "authentication",
        label: "Authentication",
        link: "/authentication",
        shortCut: "shift a",
        icon: FaSignInAlt,
      }
    );
  }

  return options;
};
