import * as React from "react";

type AlertVariant = "default" | "destructive";

interface AlertProps extends React.ComponentProps<"div"> {
  variant?: AlertVariant;
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Alert({
  className,
  variant = "default",
  ...props
}: AlertProps) {
  const variantClass =
    variant === "destructive"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-gray-200 bg-white text-gray-900";

  return (
    <div
      data-slot="alert"
      role="alert"
      className={joinClasses(
        "relative w-full rounded-lg border px-4 py-3 text-sm grid grid-cols-[0_1fr] items-start gap-y-0.5",
        variantClass,
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={joinClasses(
        "col-start-2 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={joinClasses(
        "col-start-2 grid justify-items-start gap-1 text-sm text-gray-600",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };