export default function ProgressBar({ value, color = "accent", height = "h-1.5", animate = false, showLabel = false }) {
  const colorMap = {
    accent: "bg-[#E8602A]",
    success: "bg-green-500",
    warning: "bg-amber-400",
    danger: "bg-red-500",
    blue: "bg-blue-500",
    gray: "bg-stone-300",
  };

  const barColor = colorMap[color] || colorMap.accent;
  const pct = Math.min(Math.max(value, 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[#78716C]">{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-[#E7E5E4] rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full ${barColor} ${animate ? "fill-animate" : ""} transition-all duration-700`}
          style={animate ? { "--bar-width": `${pct}%`, width: 0 } : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
