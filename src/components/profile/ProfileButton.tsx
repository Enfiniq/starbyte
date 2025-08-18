import clsx from "clsx";
import { ReactNode } from "react";

interface ProfileButtonProps {
  id?: string;
  title: string;
  rightIcon?: ReactNode;
  leftIcon?: ReactNode;
  containerClass?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
}

const ProfileButton = ({
  id,
  title,
  rightIcon,
  leftIcon,
  containerClass,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  ariaLabel,
}: ProfileButtonProps) => {
  const sizeClass = size === "sm" ? "px-4 py-2" : "px-7 py-3";
  const variantClass =
    variant === "secondary"
      ? "bg-transparent border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
      : "bg-[#4f7cff] text-white";

  return (
    <button
      id={id}
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "group relative z-10 w-fit overflow-hidden rounded-full font-general text-xs uppercase",
        sizeClass,
        variantClass,
        disabled && "opacity-50 cursor-not-allowed",
        containerClass
      )}
    >
      {leftIcon}

      <span className="relative inline-flex overflow-hidden">
        <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
          {title}
        </div>
        <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
          {title}
        </div>
      </span>

      {rightIcon}
    </button>
  );
};

export default ProfileButton;
