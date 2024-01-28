import IconColors from "./IconColors";
import NodeTypes from "./NodeTypes";
import IconTypes from "./IconTypes";
import IconRenderer from "../../IconRenderer";
import { Tooltip } from "../../utilities";

function NodeFooter({ progress, type, status, label }) {
  const iconType = IconTypes[status];
  const iconColor = IconColors[status];
  const iconTooltip = `Test ${NodeTypes.TESTSCENARIO_NODE === type ? "scenario" : "case"} is ${status}`;

  return (
    <div className="inline-flex justify-between items-center p-0.5">
      {label && <span className="break-words text-xs font-medium">{label}</span>}
      <Tooltip title={label} content={iconTooltip}>
        <RenderStatusIcon icon={iconType} iconColor={iconColor} progress={progress} />
      </Tooltip>
    </div>
  );
}

function RenderStatusIcon({ icon, iconColor, progress }) {
  return (
    <IconRenderer
      icon={icon}
      className={`ml-1 first-line:${progress < 100 && icon === IconTypes.ACTIVE && "animate-pulse"} ${iconColor}`}
      style={{ fontSize: 14 }}
    />
  );
}

export default NodeFooter;
