"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

type ToggleVariant = "default" | "outline";
type ToggleSize = "sm" | "default" | "lg";

type ToggleGroupContextValue = {
  variant?: ToggleVariant;
  size?: ToggleSize;
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
});

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function getToggleClasses(variant: ToggleVariant = "default", size: ToggleSize = "default") {
  const sizeClass =
    size === "sm"
      ? "h-8 px-2 text-xs"
      : size === "lg"
      ? "h-11 px-5 text-base"
      : "h-9 px-3 text-sm";

  const variantClass =
    variant === "outline"
      ? "border border-gray-300 bg-white text-gray-900 hover:bg-gray-100"
      : "bg-gray-100 text-gray-900 hover:bg-gray-200";

  return joinClasses(
    "inline-flex items-center justify-center rounded-md font-medium transition outline-none",
    sizeClass,
    variantClass,
    "data-[state=on]:bg-blue-600 data-[state=on]:text-white"
  );
}

function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & {
  variant?: ToggleVariant;
  size?: ToggleSize;
}) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={joinClasses(
        "flex w-fit items-center rounded-md",
        variant === "outline" && "shadow-sm",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & {
  variant?: ToggleVariant;
  size?: ToggleSize;
}) {
  const context = React.useContext(ToggleGroupContext);
  const finalVariant = context.variant || variant || "default";
  const finalSize = context.size || size || "default";

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={finalVariant}
      data-size={finalSize}
      className={joinClasses(
        getToggleClasses(finalVariant, finalSize),
        "min-w-0 flex-1 shrink-0 rounded-none first:rounded-l-md last:rounded-r-md",
        finalVariant === "outline" && "first:border-l border-l-0",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };