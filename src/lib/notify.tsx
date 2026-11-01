import React from "react";
import toast from "react-hot-toast";

/**
 * Toast notifications powered by react-hot-toast.
 * Styled to match the BookNook dark forest-green & mint design system.
 */
export const notify = {
  success: (title: string, description?: string) => {
    if (!description) {
      toast.success(title, { duration: 4000 });
      return;
    }
    toast.success(
      () => (
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-semibold text-xs text-[#8fd9a8]">{title}</span>
          <span className="text-[11px] text-[#e6f0ea]/80 leading-relaxed">
            {description}
          </span>
        </div>
      ),
      {
        duration: 4000,
      }
    );
  },

  error: (title: string, description?: string) => {
    if (!description) {
      toast.error(title, { duration: 5000 });
      return;
    }
    toast.error(
      () => (
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-semibold text-xs text-rose-400">{title}</span>
          <span className="text-[11px] text-[#e6f0ea]/80 leading-relaxed">
            {description}
          </span>
        </div>
      ),
      {
        duration: 5000,
      }
    );
  },

  info: (title: string, description?: string) => {
    toast(
      () => (
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-semibold text-xs text-[#8fd9a8]">{title}</span>
          {description && (
            <span className="text-[11px] text-[#e6f0ea]/80 leading-relaxed">
              {description}
            </span>
          )}
        </div>
      ),
      {
        duration: 4000,
        icon: "🌿",
      }
    );
  },

  warning: (title: string, description?: string) => {
    toast(
      () => (
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-semibold text-xs text-[#e0915a]">{title}</span>
          {description && (
            <span className="text-[11px] text-[#e6f0ea]/80 leading-relaxed">
              {description}
            </span>
          )}
        </div>
      ),
      {
        duration: 4000,
        icon: "🍂",
      }
    );
  },
};
