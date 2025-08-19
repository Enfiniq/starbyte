"use client";

import "@/styles/authentication-page-styles.css";
import React, { useEffect, useState } from "react";
import ProfileButton from "@/components/profile/ProfileButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User as UserIcon, Link as LinkIcon } from "lucide-react";
import { CiCamera } from "react-icons/ci";
import VerificationBadge from "@/components/shared/VerificationBadge";
import AvatarGallery from "@/components/AvatarGallery";
import UsernameField from "@/components/auth/UsernameField";
import { uploadImage } from "@/lib/uploadProfileAvatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useStar from "@/hooks/useStar";
import type { Star } from "@/types/Star";
import { starProfileUpdateSchema } from "@/schemas/starProfile";
import { useProfileDraft } from "@/providers/ProfileDraftProvider";
import { spendStardust, updateStarProfile } from "@/supabase/rpc/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Loader from "@/components/loader";

function makeFileChangeHandler(
  star: Star | null,
  setIsImageLoading: (v: boolean) => void,
  onFilePicked: (file: File) => void
) {
  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!star) return;
    if ((star.stardust ?? 0) < 10) {
      toast("You need 10 Stardust to upload a custom avatar.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("File too large. Please select a file under 5MB.");
      return;
    }
    onFilePicked(file);
  };
}

type HeaderProps = {
  star: Star | null;
  starName: string;
  displayName: string;
  bio: string;
  avatar: string;
};

function AvatarBlock({
  star,
  displayName,
  avatar,
}: {
  star: Star | null;
  displayName: string;
  avatar: string;
}) {
  return (
    <div className="relative h-28 w-28 flex flex-row justify-center items-center rounded-full p-1">
      <div className="absolute inset-0 bg-[#4f7cff] rounded-full p-4"></div>
      <div className="relative bg-white dark:bg-black h-full w-full rounded-full flex flex-row justify-center items-center">
        <Avatar className="w-24 h-24 unselectable border">
          <AvatarImage
            alt={(star?.starName || "") + "'s Avatar"}
            src={avatar || star?.avatar || undefined}
          />
          <AvatarFallback>
            {(displayName || star?.displayName || "").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute top-0 right-0 h-3 w-3 bg-gradient-to-r from-primary to-blue-500  rounded-full"></div>
      </div>
    </div>
  );
}

function InfoBlock({
  star,
  starName,
  displayName,
  bio,
}: {
  star: Star | null;
  starName: string;
  displayName: string;
  bio: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold flex gap-2 items-center">
        <VerificationBadge
          star={star ? { ...star, starName } : null}
          size={32}
          tooltip={true}
        />
      </h2>
      <p className="text-skin-muted-500 dark:text-skin-muted-400 flex flex-row">
        Bio: {bio}
      </p>
      <p className="text-skin-muted-500 dark:text-skin-muted-400 flex flex-row">
        Display Name: {displayName || star?.displayName || ""}
      </p>
    </div>
  );
}

function ProfileHeader({
  star,
  starName,
  displayName,
  bio,
  avatar,
}: HeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
      <AvatarBlock star={star} displayName={displayName} avatar={avatar} />
      <div className="space-y-4">
        <InfoBlock
          star={star}
          starName={starName}
          displayName={displayName}
          bio={bio}
        />
      </div>
    </div>
  );
}

type AvatarEditorProps = {
  star: Star | null;
  avatar: string;
  displayName: string;
  isImageLoading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPickPreset: (src: string) => void;
};

function AvatarPreview({
  star,
  avatar,
  displayName,
  isImageLoading,
}: {
  star: Star | null;
  avatar: string;
  displayName: string;
  isImageLoading: boolean;
}) {
  return (
    <div className="relative group h-28 w-28">
      <Avatar className="h-28 w-28 border">
        <AvatarImage
          alt={(star?.starName || "") + "'s Avatar"}
          src={avatar || star?.avatar || undefined}
        />
        <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-center items-center bg-slate-100/50 dark:bg-slate-900/50">
        <CiCamera />
      </div>
      {isImageLoading && (
        <div className="absolute inset-0 rounded-full flex justify-center items-center bg-black/40">
          <Loader2 className="animate-spin h-6 w-6 text-white" />
        </div>
      )}
    </div>
  );
}

function AvatarEditor({
  star,
  avatar,
  displayName,
  isImageLoading,
  onFileChange,
  onPickPreset,
}: AvatarEditorProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const handlePick = (src: string) => {
    onPickPreset(src);
    setOpen(false);
  };
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">Avatar</label>
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-start gap-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button type="button" aria-label="Choose preset avatar">
                <AvatarPreview
                  star={star}
                  avatar={avatar}
                  displayName={displayName || star?.displayName || ""}
                  isImageLoading={isImageLoading}
                />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Choose a preset</DialogTitle>
                <DialogDescription>
                  Pick a quick preset for your signature snap.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                <AvatarGallery setPreBuildAvatar={handlePick} />
              </div>
            </DialogContent>
          </Dialog>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/svg+xml, image/jpg"
            className="hidden"
            onChange={onFileChange}
          />
          <ProfileButton
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Upload custom"
          />
        </div>

        <div className="grid gap-2 w-full">
          <label className="text-sm font-medium">Avatar URL</label>
          <div
            className={`input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 relative ${
              isImageLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <LinkIcon className="icon text-gray-600 dark:text-gray-300" />
            <input
              name="avatarUrl"
              type="url"
              placeholder="https://... (or loomingface URL)"
              value={avatar}
              onChange={(e) => onPickPreset(e.target.value)}
              required
              autoComplete="off"
              aria-invalid={false}
              aria-describedby={undefined}
              disabled={isImageLoading}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-skin-muted-500 dark:text-skin-muted-400">
        Uploading a custom image requires 10 Stardust.
      </p>
    </div>
  );
}

export default function Page() {
  const { star, loading } = useStar();
  const router = useRouter();
  const lastStarSnapshot = React.useRef<{
    starName: string;
    displayName: string;
    bio: string;
    avatar: string;
  } | null>(null);

  const {
    starName,
    setStarName,
    displayName,
    setDisplayName,
    bio,
    setBio,
    avatar,
    setAvatar,
    reset,
  } = useProfileDraft();

  const [isSaving, setIsSaving] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmSpendOpen, setConfirmSpendOpen] = useState(false);

  useEffect(() => {
    router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!star) return;
    const snapshot = {
      starName: star.starName || "",
      displayName: star.displayName || "",
      bio: star.bio || "",
      avatar: star.avatar || "",
    };
    const prev = lastStarSnapshot.current;
    const draftMatchesPrev =
      prev &&
      prev.starName === starName &&
      prev.displayName === displayName &&
      prev.bio === bio &&
      prev.avatar === avatar;

    if (!prev || draftMatchesPrev) {
      setStarName(snapshot.starName);
      setDisplayName(snapshot.displayName);
      setBio(snapshot.bio);
      setAvatar(snapshot.avatar);
      lastStarSnapshot.current = snapshot;
    } else {
      lastStarSnapshot.current = snapshot;
    }
  }, [
    star,
    starName,
    displayName,
    bio,
    avatar,
    setStarName,
    setDisplayName,
    setBio,
    setAvatar,
  ]);

  const setPreBuildAvatar = (newAvatar: string) => {
    setAvatar(newAvatar);
  };

  const handleProfilePicChange = makeFileChangeHandler(
    star,
    setIsImageLoading,
    (file) => {
      setPendingFile(file);
      setConfirmSpendOpen(true);
    }
  );

  const saveProfile = async () => {
    if (!star) return;
    setIsSaving(true);

    const parsed = starProfileUpdateSchema.safeParse({
      starName,
      displayName,
      bio,
      avatar,
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast(`${first.message}`);
      setIsSaving(false);
      return;
    }

    try {
      const res = await updateStarProfile({
        userId: star.id,
        starName: parsed.data.starName,
        displayName: parsed.data.displayName,
        bio: parsed.data.bio,
        avatar: parsed.data.avatar,
      });
      if (!res?.success) {
        toast(res?.error || "Failed to update profile");
      } else {
        toast("Profile updated");
        setStarName(parsed.data.starName);
        setDisplayName(parsed.data.displayName);
        setBio(parsed.data.bio ?? "");
        setAvatar(parsed.data.avatar ?? "");
        router.refresh();
        router.push("/home");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Please try again";
      toast(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!star) return;
    reset({
      starName: star.starName || "",
      displayName: star.displayName || "",
      bio: star.bio || "",
      avatar: star.avatar || "",
    });
  };

  return (
    <>
      {loading && <Loader className="bg-white dark:bg-black" />}

      <div className="mx-auto py-12 mb-12 px-4 md:px-6 lg:px-8">
        {!loading && (
          <ProfileHeader
            star={star}
            starName={starName}
            displayName={displayName}
            bio={bio}
            avatar={avatar}
          />
        )}
      </div>

      <Dialog open={confirmSpendOpen} onOpenChange={setConfirmSpendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spend 10 Stardust?</DialogTitle>
            <DialogDescription>
              Applying this custom avatar will cost 10 Stardust. Do you want to
              continue?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <ProfileButton
              title="Cancel"
              variant="secondary"
              onClick={() => {
                setConfirmSpendOpen(false);
                setPendingFile(null);
              }}
              disabled={isImageLoading}
            />
            <ProfileButton
              title="Confirm"
              onClick={async () => {
                if (!star || !pendingFile) {
                  setConfirmSpendOpen(false);
                  return;
                }
                setIsImageLoading(true);
                const spend = await spendStardust(star.id, 10);
                if (!spend?.success) {
                  setIsImageLoading(false);
                  toast(spend?.error || "Unable to spend Stardust");
                  return;
                }

                try {
                  const url = await uploadImage(pendingFile);
                  if (!url) throw new Error("Upload failed");
                  setAvatar(url);
                } catch (err) {
                  const msg =
                    err instanceof Error ? err.message : "Upload failed";
                  toast(msg);
                } finally {
                  setIsImageLoading(false);
                  setPendingFile(null);
                  setConfirmSpendOpen(false);
                }
              }}
              disabled={isImageLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-transparent mb-12">
        <div className="px-4 md:px-0">
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Customize Profile</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Star name</label>
                  <UsernameField
                    className={isSaving ? "opacity-50 cursor-not-allowed" : ""}
                    editProfile
                    value={starName}
                    defaultValue={star?.starName || ""}
                    onChange={setStarName}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Display name</label>
                  <div
                    className={`input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 relative ${
                      isSaving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <UserIcon className="icon text-gray-600 dark:text-gray-300" />
                    <input
                      name="displayName"
                      type="text"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      minLength={1}
                      maxLength={50}
                      autoComplete="name"
                      aria-invalid={displayName.trim().length === 0}
                      aria-describedby={undefined}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="resize-none w-full rounded-md border bg-background px-3 py-2 text-sm"
                  maxLength={150}
                  placeholder="Enter a short description (max 150 characters)"
                  value={bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setBio(e.target.value)
                  }
                />
              </div>

              <AvatarEditor
                star={star}
                avatar={avatar}
                displayName={displayName}
                isImageLoading={isImageLoading}
                onFileChange={handleProfilePicChange}
                onPickPreset={setPreBuildAvatar}
              />

              <div className="h-px w-full bg-border" />
            </div>

            <div className="flex justify-end gap-3">
              <ProfileButton
                title="Reset"
                variant="secondary"
                onClick={handleReset}
              />
              <ProfileButton
                title={isSaving ? "Please wait" : "Save Changes"}
                onClick={saveProfile}
                disabled={isSaving || isImageLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
