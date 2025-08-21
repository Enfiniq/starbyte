"use client";

import "@/styles/input-styles.css";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  Upload,
  MessageCircle,
  Target,
  ImagePlus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import ImageSlider from "@/components/ImageSlider";
import ProfileButton from "@/components/profile/ProfileButton";
import { dateFromNow } from "@/lib/formattedDate";
import useStar from "@/hooks/useStar";
import Loader from "@/components/loader";
import { toast } from "sonner";
import {
  getUserParticipatingBytes,
  submitByteProof,
  createProgressNote,
  createRegret,
  addByteComment,
  type ParticipatingByte,
} from "@/supabase/rpc/client";
import { uploadPublicFile } from "@/lib/uploadPublicFile";

type AcceptedByte = {
  id: string;
  title: string;
  description: string;
  creator: {
    star_name: string;
    display_name?: string;
    avatar?: string;
  };
  stardust_reward: number;
  progress_percentage: number;
  status: "active" | "completed" | "expired";
  accepted_at: string;
  deadline?: string;
  proof_count: number;
  required_proofs: number;
  preview_image_url?: string[];
  difficulty?: string;
  challenge_type?: string;
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

function BytesContent() {
  const searchParams = useSearchParams();
  const { star, loading: starLoading } = useStar();

  const [searchQuery, setSearchQuery] = useState(
    searchParams?.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams?.get("status") || "all"
  );

  const [selectedByteId, setSelectedByteId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<Comment["type"]>("comment");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [loadingList, setLoadingList] = useState(true);
  const [acceptedList, setAcceptedList] = useState<ParticipatingByte[]>([]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!star?.id) {
        setLoadingList(false);
        return;
      }

      try {
        setLoadingList(true);
        const res = await getUserParticipatingBytes({
          starId: star.id,
          status: null,
        });
        if (!ignore) {
          if (res.success) {
            setAcceptedList(res.bytes);
          } else {
            console.error("Failed to load bytes:", res.error);
            toast.error(res.error || "Failed to load challenges");
          }
        }
      } catch (error) {
        console.error("Error loading bytes:", error);
        if (!ignore) toast.error("Failed to load challenges");
      } finally {
        if (!ignore) setLoadingList(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [star?.id]);

  const mapStatus = (s: string): AcceptedByte["status"] => {
    if (s === "completed") return "completed";
    if (s === "expired") return "expired";
    return "active";
  };

  const filteredAcceptedBytes = useMemo(() => {
    const items: AcceptedByte[] = acceptedList.map((b) => ({
      id: b.id,
      title: b.title,
      description: b.description || "",
      creator: {
        star_name: b.creator.star_name,
        display_name: b.creator.display_name || undefined,
        avatar: b.creator.avatar || undefined,
      },
      stardust_reward: b.stardust_reward || 0,
      progress_percentage: b.participation.progress_percentage || 0,
      status: mapStatus(b.participation.status || "active"),
      accepted_at: b.participation.joined_at,
      deadline: b.expires_at || undefined,
      proof_count: b.participation.current_proof_count || 0,
      required_proofs: b.participation.required_proof_count || 0,
      preview_image_url: b.preview_image_url || undefined,
      difficulty: undefined,
      challenge_type: undefined,
    }));

    const filtered = items.filter((byte) => {
      const matchesSearch =
        byte.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        byte.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || byte.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered;
  }, [acceptedList, searchQuery, statusFilter]);

  const handleSubmitComment = async () => {
    if (!star || !selectedByteId) return;

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

      if (commentType === "comment") {
        setUploadedFiles([]);
        const res = await addByteComment({
          byteId: selectedByteId,
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
              `byte-proofs/${selectedByteId}`
            );
          } catch (e) {
            console.error("Upload failed", e);
            toast.error("Image upload failed");
          }
        }
        const res = await submitByteProof({
          byteId: selectedByteId,
          starId: star.id,
          proofText: newComment,
          proofImageUrl: imageUrl,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to submit proof");
      } else if (commentType === "progress_note") {
        let imageUrl: string | null = null;
        if (uploadedFiles.length > 0) {
          try {
            imageUrl = await uploadPublicFile(
              uploadedFiles[0],
              `progress-notes/${selectedByteId}`
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
          byteId: selectedByteId,
        });
        if (!res.success) throw new Error(res.error || "Failed to post note");
      } else if (commentType === "regret") {
        setUploadedFiles([]);
        const res = await createRegret({
          starId: star.id,
          title: null,
          content: newComment,
          byteId: selectedByteId,
        });
        if (!res.success)
          throw new Error(res.error || "Failed to share regret");
      }

      const res = await getUserParticipatingBytes({
        starId: star.id,
        status: null,
      });
      if (res.success) setAcceptedList(res.bytes);

      setNewComment("");
      setUploadedFiles([]);
      setSelectedByteId(null);
      setCommentType("comment");
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

  const getStatusBadge = (status: AcceptedByte["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Completed
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  if (starLoading) {
    return <Loader />;
  }

  if (!star) {
    return (
      <div className="container mx-auto px-4 py-8 text-center max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-muted-foreground">
          You need to be signed in to view your bytes.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[#4f7cff]" />
          Add Content
        </h3>

        {!selectedByteId ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground">
              Select &quot;Add Content&quot; on a challenge to share comments,
              proofs, or progress notes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {
                      filteredAcceptedBytes.find((b) => b.id === selectedByteId)
                        ?.title
                    }
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Selected challenge
                  </p>
                </div>
                <button
                  onClick={() => setSelectedByteId(null)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  title="Remove selection"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-center flex-wrap">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={star?.avatar || "/placeholder-star.jpg"}
                    alt={star?.displayName || star?.starName || "User"}
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
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="proof">Proof</SelectItem>
                    <SelectItem value="progress_note">Progress Note</SelectItem>
                    <SelectItem value="regret">Regret</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    commentType === "comment" || commentType === "regret"
                      ? "text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                      : "text-[#4f7cff] bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40"
                  }`}
                  onClick={() => {
                    if (commentType !== "comment" && commentType !== "regret") {
                      document.getElementById("comment-file")?.click();
                    }
                  }}
                  type="button"
                  disabled={
                    commentType === "comment" || commentType === "regret"
                  }
                >
                  <ImagePlus className="h-4 w-4" />
                  Add image
                </button>
                {uploadedFiles.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-sm text-green-700 dark:text-green-300">
                      {uploadedFiles.length} file(s)
                    </span>
                    <button
                      onClick={() => setUploadedFiles([])}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <div
                  className={`input-field ${
                    commentError ? "border-red-500" : ""
                  }`}
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
                    required={
                      commentType === "comment" || commentType === "regret"
                    }
                    autoComplete="off"
                    disabled={submitting || !star}
                    aria-invalid={Boolean(commentError)}
                    aria-describedby={
                      commentError ? "comment-error" : undefined
                    }
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
                    setSelectedByteId(null);
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
            </div>

            {uploadedFiles.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Image Preview
                </p>
                <div className="flex gap-3 items-center flex-wrap">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
                      />
                      <button
                        onClick={() =>
                          setUploadedFiles((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              id="comment-file"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Accepted Bytes</h1>
          <p className="text-muted-foreground mt-1">
            Track your accepted challenges and progress
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>{filteredAcceptedBytes.length} challenges</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1">
          <div className="input-field">
            <Search className="icon text-[#4f7cff]" aria-hidden="true" />
            <input
              name="search"
              type="text"
              placeholder="Search your challenges..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-4">
        {loadingList ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 w-3/4"></div>
                    <div className="h-4 bg-gray-200 w-1/2"></div>
                    <div className="h-3 bg-gray-200 w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAcceptedBytes.length === 0 ? (
          <div className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No challenges found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search or filters."
                : "You haven't accepted any challenges yet."}
            </p>
            {!searchQuery && (
              <Link href="/">
                <ProfileButton title="Explore Challenges" size="sm" />
              </Link>
            )}
          </div>
        ) : (
          filteredAcceptedBytes.map((byte) => (
            <div key={byte.id} className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Image */}
                <div className="w-32 h-32 overflow-hidden bg-gray-100 flex-shrink-0">
                  {byte.preview_image_url &&
                  byte.preview_image_url.length > 0 ? (
                    <ImageSlider
                      urls={byte.preview_image_url}
                      aspectRatio="square"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Target className="h-10 w-10" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <Link
                      href={`/bytes/${byte.id}`}
                      className="hover:text-[#4f7cff] transition-colors"
                    >
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {byte.title}
                      </h3>
                    </Link>
                    {getStatusBadge(byte.status)}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {byte.description}
                  </p>

                  {/* Creator */}
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={byte.creator.avatar || "/placeholder-star.jpg"}
                        alt={
                          byte.creator.display_name || byte.creator.star_name
                        }
                      />
                      <AvatarFallback className="text-xs">
                        {(byte.creator.display_name || byte.creator.star_name)
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      by {byte.creator.display_name || byte.creator.star_name}
                    </span>
                  </div>

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#4f7cff]" />
                      <span>{byte.stardust_reward}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Upload className="h-4 w-4 text-[#4f7cff]" />
                      <span>
                        {byte.proof_count}/{byte.required_proofs}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dateFromNow(byte.accepted_at)}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {byte.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#4f7cff] h-2 rounded-full transition-all"
                        style={{ width: `${byte.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <ProfileButton
                      title="Add Content"
                      size="sm"
                      onClick={() => setSelectedByteId(byte.id)}
                    />
                    <Link href={`/bytes/${byte.id}`}>
                      <ProfileButton
                        title="View Details"
                        variant="secondary"
                        size="sm"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default function BytesPage() {
  return (
    <Suspense fallback={<Loader />}>
      <BytesContent />
    </Suspense>
  );
}
