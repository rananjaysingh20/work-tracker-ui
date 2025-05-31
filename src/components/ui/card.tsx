import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isDark?: boolean }
>(({ className, isDark, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border shadow-sm",
      isDark 
        ? "bg-gray-900/40 backdrop-blur-sm border-gray-700/30 text-white" 
        : "bg-white/50 backdrop-blur-sm border-gray-200/50 text-gray-900",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isDark?: boolean }
>(({ className, isDark, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      isDark ? "text-gray-100" : "text-gray-900",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { isDark?: boolean }
>(({ className, isDark, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      isDark ? "text-white" : "text-gray-900",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { isDark?: boolean }
>(({ className, isDark, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm",
      isDark ? "text-gray-300" : "text-gray-500",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isDark?: boolean }
>(({ className, isDark, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6 pt-0",
      isDark ? "text-gray-100" : "text-gray-900",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isDark?: boolean }
>(({ className, isDark, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      isDark ? "text-gray-100" : "text-gray-900",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
