import * as React from "react";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={joinClasses("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "relative flex items-center justify-center pt-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button:
          "flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white p-0 text-gray-700 opacity-70 hover:opacity-100",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "w-8 rounded-md text-[0.8rem] font-normal text-gray-500",
        row: "mt-2 flex w-full",
        cell: "relative p-0 text-center text-sm",
        day: "h-8 w-8 rounded-md p-0 font-normal hover:bg-gray-100",
        day_selected: "bg-blue-600 text-white hover:bg-blue-600",
        day_today: "bg-gray-200 text-gray-900",
        day_outside: "text-gray-400",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle: "bg-blue-100 text-gray-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      
      {...props}
    />
  );
}

export { Calendar };