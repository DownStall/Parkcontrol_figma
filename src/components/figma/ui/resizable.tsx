"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function ResizablePanelGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="resizable-panel-group"
      className={joinClasses("flex h-full w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ResizablePanel({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="resizable-panel"
      className={joinClasses("flex-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  withHandle?: boolean;
}) {
  return (
    <div
      data-slot="resizable-handle"
      className={joinClasses(
        "relative flex w-px items-center justify-center bg-gray-300",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded border bg-gray-200">
          <GripVerticalIcon className="h-2.5 w-2.5" />
        </div>
      )}
    </div>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };