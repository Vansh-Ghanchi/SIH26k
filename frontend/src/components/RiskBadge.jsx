export default function RiskBadge({ level, size = "md" }) {
  const configs = {
    Critical: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "CRITICAL" },
    High: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400", label: "HIGH" },
    Medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", label: "MEDIUM" },
    Low: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", label: "LOW" },
  };

  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  const cfg = configs[level] || configs.Low;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${cfg.bg} ${cfg.text} ${sizeClass}`}>
      <span className={`${dotSize} rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  );
}
