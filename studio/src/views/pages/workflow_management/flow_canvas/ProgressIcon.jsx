import { IconRenderer } from "@utilities/.";

const ProgressIcon = ({ progress = 0, status, size = 50, icon }) => {
  const running = status === "ACTIVE" || (progress > 0 && progress < 100);
  const strokeColor = status === "ERRORED" ? "#DC2626" : running ? "#059669" : "#ffffff";
  const total = 100;
  const values = [
    {
      value: Math.floor(progress)
    }
  ];
  const percentages = values.reduce(
    (acc, { value }) => {
      const pct = (value / total) * 100;
      acc.values.push({
        value: pct,
        offset: 100 - acc.total + 25
      });
      return {
        values: acc.values,
        total: acc.total + pct
      };
    },
    { values: [], total: 0 }
  );

  if (!running) return <IconRenderer className="text-slate-600 mx-5" icon={icon} style={{ fontSize: 50 }} />;

  return (
    <div className={`${running ? "animate-pulse" : ""}`}>
      <svg width={size} height={size} viewBox="0 0 40 40">
        {running && <circle cx="20" cy="20" r="14" fill="transparent" stroke="#c8c9da" strokeWidth={2} />}
        {running &&
          percentages &&
          Array.isArray(percentages.values) &&
          percentages.values.map(({ value, offset }, index) => (
            <circle
              key={index}
              cx="20"
              cy="20"
              r={running ? 13 : 14}
              fill="transparent"
              strokeWidth={running ? 4 : 2}
              stroke={strokeColor}
              strokeDasharray={[value, 100 - value]}
              strokeDashoffset={offset}
            />
          ))}
        <IconRenderer
          icon={icon}
          width={!running ? 25 : 20}
          height={!running ? 25 : 20}
          x={!running ? 8 : 10}
          y={!running ? 5 : 10}
          style={{ color: "#6d48bf" }}
        />
      </svg>
    </div>
  );
};

export default ProgressIcon;
