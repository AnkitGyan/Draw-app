import { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}