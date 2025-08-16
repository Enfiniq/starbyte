"use client";

import { ChangeEvent, useState } from "react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FaHome,
  FaUser,
  FaStar,
  FaTrophy,
  FaDumbbell,
  FaShoppingCart,
} from "react-icons/fa";
import useStar from "@/hooks/useStar";
import { MdOutlineZoomOutMap, MdOutlineZoomInMap } from "react-icons/md";
import VerificationBadge from "@/components/shared/VerificationBadge";
import { DEFAULT_STAR_DATA } from "@/config/starDefaultData";

const StarAccountMenu = () => {
  const { star, loading, logoutStar } = useStar();
  const { starName, avatar } = star || DEFAULT_STAR_DATA;

  const [correctStarName, setCorrectStarName] = useState("");
  async function signOutFromDevice() {
    await signOut();
    logoutStar();
  }

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="overflow-visible">
          <div className="h-auto w-full flex flex-row items-center gap-2">
            {loading ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse rounded-full bg-muted h-12 w-12"></div>
                </div>
              </>
            ) : (
              <>
                <Avatar className="relative cursor-pointer">
                  <AvatarImage
                    className="unselectable"
                    src={avatar || "/placeholder-star.jpg"}
                    alt={starName + "'s Avatar"}
                  />
                  <AvatarFallback className="unselectable">
                    {starName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-60" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-0.5 leading-none">
              <p className="font-bold text-sm">
                <Link
                  href={`/star/${starName}`}
                  className="h-auto w-full flex flex-row items-center gap-1"
                >
                  <VerificationBadge
                    star={star}
                    size="14"
                    sizeOfLogo={10}
                    tooltip={true}
                  />
                </Link>
              </p>
            </div>
          </div>

          <DropdownMenuSeparator />

          {(() => {
            const profilePath = `/star/${starName}`;
            const menuLookup: Record<
              string,
              {
                label: string;
                href: string;
                icon: ComponentType<{ className?: string }>;
              }
            > = {
              home: { label: "Home", href: "/home", icon: FaHome },
              profile: { label: "Profile", href: profilePath, icon: FaUser },
              bytes: { label: "Bytes", href: "/bytes", icon: FaDumbbell },
              stars: { label: "Stars", href: "/stars", icon: FaStar },
              marketplace: {
                label: "Marketplace",
                href: "/marketplace",
                icon: FaShoppingCart,
              },
              leaderboard: {
                label: "Leaderboard",
                href: "/leaderboard",
                icon: FaTrophy,
              },
            };

            const order = [
              "home",
              "profile",
              "bytes",
              "stars",
              "marketplace",
              "leaderboard",
            ] as const;

            return order.map((key) => {
              const Item = menuLookup[key];
              const Icon = Item.icon;
              return (
                <DropdownMenuItem asChild key={key}>
                  <Link
                    href={Item.href}
                    className="h-auto w-full flex flex-row items-center gap-2 cursor-pointer"
                  >
                    <Icon className="text-primary/80 hover:text-primary" />
                    {Item.label}
                  </Link>
                </DropdownMenuItem>
              );
            });
          })()}

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <div onClick={toggleFullscreen}>
              <div className="hidden sm:flex h-auto w-full flex-row items-center gap-2 cursor-pointer">
                {isFullscreen ? (
                  <MdOutlineZoomInMap className="text-primary/80 hover:text-primary" />
                ) : (
                  <MdOutlineZoomOutMap className="text-primary/80 hover:text-primary" />
                )}
                {isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="hidden sm:flex" />

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer text-primary/80 hover:text-primary  w-full border-none"
              >
                Logout
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Are you sure to Logout?</DialogTitle>
                <DialogDescription>
                  {`Type "${starName}" to Logout from this device.`}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="starName" className="text-right">
                    StarName
                  </Label>
                  <Input
                    id="starName"
                    className="col-span-3"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCorrectStarName(e.target.value)
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() => signOutFromDevice()}
                  disabled={correctStarName !== starName}
                >
                  Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default StarAccountMenu;
