"use client";

import "@/styles/input-styles.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  Star,
  MessageCircle,
  Upload,
  CheckCircle,
  AlertTriangle,
  ImagePlus,
  Sprout,
  Gauge,
  Flame,
  Zap,
  MonitorPlay,
  Dumbbell,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageSlider from "@/components/ImageSlider";
import VerificationBadge from "@/components/shared/VerificationBadge";
import { dateFromNow } from "@/lib/formattedDate";
import useStar from "@/hooks/useStar";
import Loader from "@/components/loader";
import { toast } from "sonner";
import { uploadPublicFile } from "@/lib/uploadPublicFile";
import ProfileButton from "@/components/profile/ProfileButton";
import {
  getByteDetails,
  acceptByteChallenge,
  addByteComment,
  submitByteProof,
  createProgressNote,
  createRegret,
  type ByteDetails,
  type ByteComment as RpcByteComment,
  type ByteProof as RpcByteProof,
  type ProgressNote as RpcProgressNote,
  type Regret as RpcRegret,
} from "@/supabase/rpc/client";

const BREADCRUMBS = [
  { id: 1, name: "Home", href: "/" },
  { id: 2, name: "Bytes", href: "/bytes" },
];

type ByteDetail = {
  id: string;
  title: string;
  description: string;
  stardust_reward: number;
  current_participants: number;
  max_participants?: number;
  creator: {
    star_name: string;
    display_name?: string;
    avatar?: string;
    is_verified: boolean;
    level?: number;
    is_premium?: boolean;
  };
  created_at: string;
  expires_at?: string;
  duration_days?: number;
  estimated_duration_minutes?: number;
  preview_image_url?: string[];
  requires_proof: boolean;
  required_proofs_count: number;
  auto_approve: boolean;
  proof_instructions?: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard" | "extreme";
  category: string;
  recurrence?: string | null;
  custom_recurrence_days?: number | null;
  is_active?: boolean | null;
  challenge_type?: string | null;
  completions_count?: number | null;
  is_accepted: boolean;
  user_progress?: {
    accepted_at: string;
    progress_percentage: number;
    submitted_proofs: number;
    is_completed: boolean;
  };
};

type Comment = {
  id: string;
  author: {
    star_name: string;
    display_name?: string;
    avatar?: string;
    is_verified: boolean;
  };
  content: string;
  type: "comment" | "proof" | "progress_note" | "regret";
  created_at: string;
  files?: string[];
  is_approved?: boolean;
  proof_day?: number;
};

export default function ByteDetailPage() {
  const params = useParams();
  const byteId = params.byteId as string;
  const { star, loading: starLoading } = useStar();

  const [byte, setByte] = useState<ByteDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<Comment["type"]>("comment");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchByteDetail = async () => {
      try {
        setLoading(true);
        const res = await getByteDetails(byteId, star?.id);
        if (!res.success || !res.byte) {
          toast.error(res.error || "Failed to load byte");
          return;
        }
        const b: ByteDetails = res.byte;
        const isAccepted = !!b.user_participation;
        const current = b.user_participation?.current_proof_count || 0;
        const required =
          b.user_participation?.required_proof_count ||
          b.required_proofs_count ||
          0;
        const progressPct =
          required > 0 ? Math.floor((current / required) * 100) : 0;

        const mapped: ByteDetail = {
          id: b.id,
          title: b.title,
          description: b.description || "",
          stardust_reward: b.stardust_reward || 0,
          current_participants: b.current_participants || 0,
          max_participants: b.max_participants || undefined,
          creator: {
            star_name: b.creator.star_name,
            display_name: b.creator.display_name || undefined,
            avatar: b.creator.avatar || undefined,
            is_verified: !!b.creator.is_verified,
            level: b.creator.level || 0,
            is_premium: !!b.creator.is_premium,
          },
          created_at: b.created_at || new Date().toISOString(),
          expires_at: b.expires_at || undefined,
          duration_days: b.duration_days || undefined,
          estimated_duration_minutes: b.estimated_duration_minutes || undefined,
          preview_image_url: b.preview_image_url || undefined,
          requires_proof: !!b.requires_proof,
          required_proofs_count: b.required_proofs_count || 0,
          auto_approve: !!b.auto_approve,
          proof_instructions: b.proof_instructions || undefined,
          tags: b.tags || [],
          difficulty:
            b.difficulty === "easy" ||
            b.difficulty === "medium" ||
            b.difficulty === "hard" ||
            b.difficulty === "extreme"
              ? b.difficulty
              : "easy",
          category: b.category || "",
          recurrence: b.recurrence_type || null,
          custom_recurrence_days: b.custom_recurrence_days || null,
          is_active: b.is_active ?? null,
          challenge_type: b.challenge_type || b.type || null,
          completions_count: b.completions_count || null,
          is_accepted: isAccepted,
          user_progress: isAccepted
            ? {
                accepted_at: b.user_participation!.joined_at,
                progress_percentage: progressPct,
                submitted_proofs: current,
                is_completed:
                  (b.user_participation!.status || "") === "completed",
              }
            : undefined,
        };

        const toUnified = (
          comments: RpcByteComment[] | undefined,
          proofs: RpcByteProof[] | undefined,
          notes: RpcProgressNote[] | undefined,
          regrets: RpcRegret[] | undefined
        ): Comment[] => {
          const arr: Comment[] = [];
          (comments || []).forEach((c) =>
            arr.push({
              id: c.id,
              author: {
                star_name: c.author.star_name,
                display_name: c.author.display_name || undefined,
                avatar: c.author.avatar || undefined,
                is_verified: !!c.author.is_verified,
              },
              content: c.content,
              type: "comment",
              created_at: c.created_at,
            })
          );
          (proofs || []).forEach((p) =>
            arr.push({
              id: p.id,
              author: {
                star_name: p.participant.star_name,
                display_name: p.participant.display_name || undefined,
                avatar: p.participant.avatar || undefined,
                is_verified: !!p.participant.is_verified,
              },
              content: p.proof_text || "",
              type: "proof",
              created_at: p.submitted_at,
              files: p.proof_image_url ? [p.proof_image_url] : undefined,
              is_approved: p.is_approved,
              proof_day: p.proof_number,
            })
          );
          (notes || []).forEach((n) =>
            arr.push({
              id: n.id,
              author: {
                star_name: n.author.star_name,
                display_name: n.author.display_name || undefined,
                avatar: n.author.avatar || undefined,
                is_verified: !!n.author.is_verified,
              },
              content: n.content,
              type: "progress_note",
              created_at: n.created_at,
              files: n.image_url ? [n.image_url] : undefined,
            })
          );
          (regrets || []).forEach((r) =>
            arr.push({
              id: r.id,
              author: {
                star_name: r.author.star_name,
                display_name: r.author.display_name || undefined,
                avatar: r.author.avatar || undefined,
                is_verified: !!r.author.is_verified,
              },
              content: r.content,
              type: "regret",
              created_at: r.created_at,
            })
          );
          return arr.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
        };

        setByte(mapped);
        setComments(
          toUnified(res.comments, res.proofs, res.progress_notes, res.regrets)
        );
      } catch {
        toast.error("Failed to fetch byte details");
      } finally {
        setLoading(false);
      }
    };
    fetchByteDetail();
  }, [byteId, star?.id]);

  const handleAcceptByte = async () => {
    if (!star) {
      toast.error("Please log in to accept this byte");
      return;
    }

    try {
      setSubmitting(true);
      const res = await acceptByteChallenge({ byteId, starId: star.id });
      if (!res.success) throw new Error(res.error || "Failed to accept");
      setByte((prev) =>
        prev
          ? {
              ...prev,
              is_accepted: true,
              current_participants: prev.current_participants + 1,
              user_progress: {
                accepted_at: new Date().toISOString(),
                progress_percentage: 0,
                submitted_proofs: 0,
                is_completed: false,
              },
            }
          : null
      );
      toast.success("Byte accepted! Let's start your journey!");
    } catch (error) {
      console.error("Failed to accept byte:", error);
      toast.error("Failed to accept byte. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!star) return;
    if (
      (commentType === "comment" || commentType === "regret") &&
      !newComment.trim()
    ) {
      setCommentError("Please write something");
      return;
    }
    try {
      setSubmitting(true);
      setCommentError(null);
      let postedImageUrl: string | null = null;
      if (commentType === "comment") {
        setUploadedFiles([]);
        const res = await addByteComment({
          byteId,
          starId: star.id,
          content: newComment,
        });
        if (!res.success) throw new Error(res.error || "Failed to comment");
      } else if (commentType === "proof") {
        let imageUrl: string | null = null;
        if (uploadedFiles.length > 0) {
          try {
            imageUrl = await uploadPublicFile(
              uploadedFiles[0],
              `byte-proofs/${byteId}`
            );
          } catch (e) {
            console.error("Upload failed", e);
            toast.error("Image upload failed");
          }
        }
        const res = await submitByteProof({
          byteId,
          starId: star.id,
          proofText: newComment,
          proofImageUrl: imageUrl,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to submit proof");
        postedImageUrl = imageUrl;
      } else if (commentType === "progress_note") {
        let imageUrl: string | null = null;
        if (uploadedFiles.length > 0) {
          try {
            imageUrl = await uploadPublicFile(
              uploadedFiles[0],
              `progress-notes/${byteId}`
            );
          } catch (e) {
            console.error("Upload failed", e);
            toast.error("Image upload failed");
          }
        }
        const res = await createProgressNote({
          starId: star.id,
          title: "Progress Update",
          content: newComment,
          imageUrl,
          byteId,
        });
        if (!res.success) throw new Error(res.error || "Failed to post note");
        postedImageUrl = imageUrl;
      } else if (commentType === "regret") {
        setUploadedFiles([]);
        const res = await createRegret({
          starId: star.id,
          title: null,
          content: newComment,
          byteId,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to share regret");
      }

      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: {
          star_name: star.starName,
          display_name: star.displayName,
          avatar: star.avatar || undefined,
          is_verified: false,
        },
        content: newComment,
        type: commentType,
        created_at: new Date().toISOString(),
        files: postedImageUrl != null ? [postedImageUrl] : undefined,
      };
      setComments((prev) => [newCommentObj, ...prev]);
      setNewComment("");
      setUploadedFiles([]);
      toast.success("Submitted successfully!");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files].slice(0, 5));
  };

  const getCommentTypeBadge = (type: Comment["type"]) => {
    switch (type) {
      case "proof":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Proof
          </Badge>
        );
      case "progress_note":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Progress
          </Badge>
        );
      case "regret":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Reflection
          </Badge>
        );
      default:
        return null;
    }
  };

  if (starLoading || loading) {
    return <Loader />;
  }

  if (!byte) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Byte Not Found</h1>
        <p className="text-muted-foreground">
          The byte you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="inline-block mt-4">
          <ProfileButton title="Return Home" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        {BREADCRUMBS.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center">
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.name}
            </Link>
            {index < BREADCRUMBS.length - 1 && <span className="mx-2">/</span>}
          </div>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="order-1 lg:order-2">
          {byte.preview_image_url && byte.preview_image_url.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              <ImageSlider urls={byte.preview_image_url} aspectRatio="video" />
            </div>
          )}
        </section>

        <section className="order-2 lg:order-1 space-y-5">
          <h1 className="text-3xl font-bold">{byte.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Link
                href={`/star/${byte.creator.star_name}`}
                className="hover:opacity-90 transition"
              >
                <Avatar className="h-8 w-8">
                  <Image
                    src={byte.creator.avatar || "/api/placeholder/32/32"}
                    alt={byte.creator.display_name || byte.creator.star_name}
                    width={32}
                    height={32}
                  />
                  <AvatarFallback>
                    {(byte.creator.display_name || byte.creator.star_name)
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex items-center gap-1">
                <VerificationBadge
                  star={{
                    starName: byte.creator.star_name,
                    displayName: byte.creator.display_name,
                    level: byte.creator.level || 0,
                    isPremium: !!byte.creator.is_premium,
                  }}
                  size={16}
                  tooltip={true}
                />
              </div>
            </div>
            <span>•</span>
            <span>{dateFromNow(byte.created_at)}</span>
            <span>•</span>
            <span>{byte.category}</span>
          </div>

          <p className="text-lg leading-relaxed">{byte.description}</p>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-[#4f7cff]" />
              <span className="text-sm">{byte.stardust_reward} Stardust</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-[#4f7cff]" />
              <span className="text-sm">
                {byte.current_participants} / {byte.max_participants || "∞"}{" "}
                participants
              </span>
            </div>
            {byte.estimated_duration_minutes && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#4f7cff]" />
                <span className="text-sm">
                  ~{byte.estimated_duration_minutes} min daily
                </span>
              </div>
            )}
            {byte.duration_days && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#4f7cff]" />
                <span className="text-sm">
                  {byte.duration_days} days duration
                </span>
              </div>
            )}
            {byte.expires_at && (
              <div className="flex items-center gap-3 sm:col-span-2">
                <AlertTriangle className="h-4 w-4 text-[#4f7cff]" />
                <span className="text-sm">
                  Expires {dateFromNow(byte.expires_at)}
                </span>
              </div>
            )}
            {byte.difficulty && (
              <div className="flex items-center gap-3">
                {byte.difficulty === "easy" && (
                  <Sprout className="h-4 w-4 text-[#4f7cff]" />
                )}
                {byte.difficulty === "medium" && (
                  <Gauge className="h-4 w-4 text-[#4f7cff]" />
                )}
                {byte.difficulty === "hard" && (
                  <Flame className="h-4 w-4 text-[#4f7cff]" />
                )}
                {byte.difficulty === "extreme" && (
                  <Zap className="h-4 w-4 text-[#4f7cff]" />
                )}
                <span className="text-sm">Difficulty: {byte.difficulty}</span>
              </div>
            )}
            {byte.is_active != null && (
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    byte.is_active ? "bg-[#4f7cff]" : "bg-gray-400"
                  }`}
                />
                <span className="text-sm">
                  Status: {byte.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            )}
            {byte.recurrence && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#4f7cff]" />
                <span className="text-sm">
                  Recurrence:{" "}
                  {byte.recurrence === "custom" && byte.custom_recurrence_days
                    ? `Every ${byte.custom_recurrence_days} days`
                    : byte.recurrence}
                </span>
              </div>
            )}
            {byte.challenge_type && (
              <div className="flex items-center gap-3">
                {byte.challenge_type === "digital" && (
                  <MonitorPlay className="h-4 w-4 text-[#4f7cff]" />
                )}
                {byte.challenge_type === "physical" && (
                  <Dumbbell className="h-4 w-4 text-[#4f7cff]" />
                )}
                <span className="text-sm">Type: {byte.challenge_type}</span>
              </div>
            )}
            {byte.completions_count != null && (
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-[#4f7cff]" />
                <span className="text-sm">
                  Completions: {byte.completions_count}
                </span>
              </div>
            )}
          </div>

          {byte.requires_proof && (
            <div className="mt-4 space-y-3">
              <h3 className="text-base font-semibold">Proof Requirements</h3>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#4f7cff]" />
                <span className="text-sm">Required</span>
              </div>
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-[#4f7cff]" />
                <span className="text-sm">
                  {byte.required_proofs_count} proofs required
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-[#4f7cff]" />
                <span className="text-sm">
                  {byte.auto_approve ? "Auto-approved" : "Manual review"}
                </span>
              </div>
              {byte.proof_instructions && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium mb-1">Instructions:</p>
                  <p className="text-sm text-muted-foreground">
                    {byte.proof_instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          {!byte.is_accepted ? (
            <ProfileButton
              title={submitting ? "Accepting..." : "Accept Challenge"}
              onClick={handleAcceptByte}
              disabled={submitting}
              size="md"
            />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700 dark:text-green-300 font-medium">
                Challenge Accepted! Progress:{" "}
                {byte.user_progress?.progress_percentage}%
              </span>
            </div>
          )}
        </section>
      </div>
      <section className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#4f7cff]" />
            Comments ({comments.length})
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort by</span>
            <Select defaultValue="new">
              <SelectTrigger className="h-8 w-28">
                <SelectValue placeholder="Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <Avatar className="h-8 w-8">
              <Image
                src={star?.avatar || "/api/placeholder/32/32"}
                alt={star?.displayName || star?.starName || "User"}
                width={32}
                height={32}
              />
              <AvatarFallback>
                {(star?.displayName || star?.starName || "U")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Select
              value={commentType}
              onValueChange={(v: Comment["type"]) => {
                setCommentType(v);
                if (v === "comment" || v === "regret") {
                  setUploadedFiles([]);
                }
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="proof">Proof</SelectItem>
                <SelectItem value="progress_note">Progress</SelectItem>
                <SelectItem value="regret">Reflection</SelectItem>
              </SelectContent>
            </Select>
            <button
              className={`flex items-center gap-1 text-sm ${
                commentType === "comment" || commentType === "regret"
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#4f7cff] hover:opacity-80"
              }`}
              onClick={() => {
                if (commentType !== "comment" && commentType !== "regret") {
                  document.getElementById("comment-file")?.click();
                }
              }}
              type="button"
              disabled={commentType === "comment" || commentType === "regret"}
            >
              <ImagePlus className="h-4 w-4" />
              Add image
            </button>
            {uploadedFiles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {uploadedFiles.length} file(s)
                </span>
                <ProfileButton
                  title="Clear"
                  variant="secondary"
                  size="sm"
                  onClick={() => setUploadedFiles([])}
                  containerClass="h-6 px-2"
                />
              </div>
            )}
          </div>

          <div className="relative">
            <div
              className={`input-field ${commentError ? "border-red-500" : ""}`}
            >
              <MessageCircle
                className="icon text-[#4f7cff]"
                aria-hidden="true"
              />
              <input
                name="comment"
                type="text"
                placeholder={`Share your ${
                  commentType === "comment"
                    ? "thoughts"
                    : commentType.replace("_", " ")
                }...`}
                required={commentType === "comment" || commentType === "regret"}
                autoComplete="off"
                disabled={submitting || !star}
                aria-invalid={Boolean(commentError)}
                aria-describedby={commentError ? "comment-error" : undefined}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            {commentError && (
              <div className="text-sm text-red-500 mt-1" id="comment-error">
                {commentError}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <ProfileButton
              title="Cancel"
              variant="secondary"
              size="sm"
              onClick={() => {
                setNewComment("");
                setUploadedFiles([]);
                setCommentType("comment");
                setCommentError(null);
              }}
              disabled={submitting}
            />
            <ProfileButton
              title={submitting ? "Submitting..." : "Send"}
              onClick={handleSubmitComment}
              disabled={
                submitting ||
                !star ||
                (!newComment.trim() && uploadedFiles.length === 0)
              }
              size="sm"
            />
          </div>

          <input
            id="comment-file"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {uploadedFiles.length > 0 && (
            <div className="mt-3">
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <Image
                    src={URL.createObjectURL(uploadedFiles[0])}
                    alt="Attachment preview"
                    width={96}
                    height={96}
                    className="object-cover rounded-md border"
                  />
                  <button
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-[#4f7cff] border border-[#4f7cff] leading-none"
                    onClick={() => setUploadedFiles([])}
                    aria-label="Remove image preview"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-6">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-[#4f7cff] mb-4" />
              <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
              <p className="text-muted-foreground">
                Be the first to share your thoughts or progress!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b last:border-b-0 pb-4 last:pb-0"
              >
                <div className="flex gap-3">
                  <Link
                    href={`/star/${comment.author.star_name}`}
                    className="hover:opacity-90 transition"
                  >
                    <Avatar className="h-8 w-8">
                      <Image
                        src={comment.author.avatar || "/api/placeholder/32/32"}
                        alt={
                          comment.author.display_name ||
                          comment.author.star_name
                        }
                        width={32}
                        height={32}
                      />
                      <AvatarFallback>
                        {(
                          comment.author.display_name ||
                          comment.author.star_name
                        )
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {comment.author.display_name ||
                          comment.author.star_name}
                      </span>
                      <VerificationBadge
                        star={{
                          starName: comment.author.star_name,
                          displayName: comment.author.display_name,
                          level: 0,
                          isPremium: false,
                        }}
                        size={14}
                        tooltip={true}
                      />
                      {getCommentTypeBadge(comment.type)}
                      {comment.proof_day && (
                        <Badge variant="outline">Day {comment.proof_day}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {dateFromNow(comment.created_at)}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed">{comment.content}</p>

                    {comment.files && comment.files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {comment.files.map((file, index) => (
                          <Image
                            key={index}
                            src={file}
                            alt={`Attachment ${index + 1}`}
                            width={120}
                            height={120}
                            className="object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </div>
                    )}

                    {comment.type === "proof" && (
                      <div className="flex items-center gap-2 text-xs">
                        {comment.is_approved ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Proof Approved</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Clock className="h-3 w-3" />
                            <span>Pending Review</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
