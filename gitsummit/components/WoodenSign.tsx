"use client";

interface WoodenSignProps {
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "warning";
}

export default function WoodenSign({
  children,
  size = "medium",
  variant = "primary",
}: WoodenSignProps) {
  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary: "bg-amber-800 border-amber-950 text-amber-50",
    secondary: "bg-green-800 border-green-950 text-green-50",
    warning: "bg-red-900 border-red-950 text-red-50",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        border-4 rounded-lg
        font-bold uppercase tracking-wide
        shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]
        transition-transform hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]
        relative
      `}
      style={{
        fontFamily: "monospace",
        textShadow: "2px 2px 0px rgba(0,0,0,0.5)",
        backgroundImage:
          "linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
      }}
    >
      {/* Wood grain texture effect */}
      <div
        className="absolute inset-0 rounded-md opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
