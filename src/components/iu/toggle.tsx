"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";

type ToggleVariant = "default" | "outline";
type ToggleSize = "sm" | "default" | "lg";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function getToggleClasses(
  variant: ToggleVariant = "default",
  size: ToggleSize = "default"
) {
  const sizeClass =
    size === "sm"
      ? "h-8 min-w-8 px-1.5 text-xs"
      : size === "lg"
      ? "h-10 min-w-10 px-2.5 text-base"
      : "h-9 min-w-9 px-2 text-sm";

  const variantClass =
    variant === "outline"
      ? "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100"
      : "bg-transparent text-gray-900 hover:bg-gray-100";

  return joinClasses(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition outline-none disabled:pointer-events-none disabled:opacity-50",
    "data-[state=on]:bg-blue-600 data-[state=on]:text-white",
    sizeClass,
    variantClass
  );
}

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & {
  variant?: ToggleVariant;
  size?: ToggleSize;
}) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={joinClasses(getToggleClasses(variant, size), className)}
      {...props}
    />
  );
}

export { Toggle, getToggleClasses as toggleVariants };