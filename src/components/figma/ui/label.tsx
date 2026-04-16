import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={joinClasses(
        "flex items-center gap-2 text-sm font-medium leading-none",
        className
      )}
      {...props}
    />
  );
}

export { Label };