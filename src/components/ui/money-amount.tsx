type Tone = "default" | "accent" | "alert";

const tones: Record<Tone, string> = {
  default: "text-foreground",
  accent: "text-accent",
  alert: "text-alert",
};

interface MoneyAmountProps {
  value: string;
  tone?: Tone;
  size?: "lg" | "md" | "sm";
}

const sizes = {
  lg: "text-5xl sm:text-6xl",
  md: "text-xl",
  sm: "text-base",
};

export function MoneyAmount({ value, tone = "default", size = "md" }: MoneyAmountProps) {
  return (
    <span
      className={`font-data whitespace-nowrap tabular-nums tracking-tight ${sizes[size]} ${tones[tone]}`}
    >
      {value}
    </span>
  );
}
