import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--input-color)] px-3 py-2 text-base text-[color:var(--foreground-color)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[color:var(--foreground-color)] placeholder:text-[color:var(--muted-foreground-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring-color)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
