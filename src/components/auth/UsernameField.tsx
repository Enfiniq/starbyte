"use client";

import { useState, useEffect, useMemo } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { Loader2, User } from "lucide-react";
import { checkUsernameUnique } from "@/supabase/rpc/client";

interface UsernameFieldProps {
  className?: string;
}

export default function UsernameField({ className = "" }: UsernameFieldProps) {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<"unknown" | "unique" | "taken">(
    "unknown"
  );
  const [inputTouched, setInputTouched] = useState(false);

  const canCheck = useMemo(() => {
    const u = username.trim();
    if (!u) return false;
    if (u.length < 2 || u.length > 20) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return false;
    return true;
  }, [username]);

  useEffect(() => {
    if (!canCheck) {
      setResult("unknown");
      setIsChecking(false);
      return;
    }

    setResult("unknown");
    setIsChecking(true);
    const valueAtRequest = username.trim();
    const timer = setTimeout(async () => {
      try {
        const data = await checkUsernameUnique(valueAtRequest);
        if (username.trim() !== valueAtRequest) return;
        const unique = data?.success === true;
        setResult(unique ? "unique" : "taken");
      } catch {
        setResult("unknown");
      } finally {
        setIsChecking(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [username, canCheck]);

  return (
    <div
      className={`input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 relative ${className}`}
    >
      <User className="icon text-gray-600 dark:text-gray-300" />
      <input
        name="starName"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onBlur={() => setInputTouched(true)}
        required
        minLength={2}
        maxLength={20}
        pattern="^[a-zA-Z0-9_]+$"
        autoComplete="new-password"
        data-lpignore="true"
        data-form-type="other"
      />
      <div className="absolute flex h-full items-center right-3 top-0">
        {isChecking && (
          <Loader2 className="animate-spin w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
        {!isChecking &&
          inputTouched &&
          result !== "unknown" &&
          (result === "unique" ? (
            <FaCheck className="text-green-500 w-4 h-4" />
          ) : (
            <FaXmark className="text-red-500 w-4 h-4" />
          ))}
      </div>
    </div>
  );
}
