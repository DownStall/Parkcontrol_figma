import * as React from "react";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={joinClasses(
        "bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4",
        onClick ? "cursor-pointer active:scale-95" : "",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={joinClasses("mb-2 flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<"h4">) {
  return (
    <h4
      className={joinClasses("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={joinClasses("text-sm text-gray-600", className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={joinClasses("mt-2", className)}
      {...props}
    />
  );
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={joinClasses("mt-4 flex items-center", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};