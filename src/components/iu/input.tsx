import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function Input({
  label,
  error,
  icon,
  rightIcon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          data-slot="input"
          className={`h-12 w-full rounded-xl border-2 bg-gray-50 px-4 transition-all focus:border-blue-500 focus:bg-white focus:outline-none ${
            icon ? "pl-12" : ""
          } ${rightIcon ? "pr-12" : ""} ${
            error ? "border-red-500" : "border-gray-200"
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export { Input };