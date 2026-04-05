import { type BitProgressProps, Progress } from "@phena/ui/components/8bit/progress";

interface HealthBarProps extends React.ComponentProps<"div"> {
  className?: string;
  props?: BitProgressProps;
  variant?: "retro" | "default";
  value?: number;
  max?: number;
  label?: string;
}

export default function HealthBar({
  className,
  variant,
  value,
  max,
  label,
  ...props
}: HealthBarProps) {
  return (
    <Progress
      {...props}
      value={value}
      variant={variant}
      className={className}
      progressBg="bg-red-500"
    />
  );
}
