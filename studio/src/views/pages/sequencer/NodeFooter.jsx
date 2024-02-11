import IconColors from "./IconColors";
import { NodeTypes } from "./Constants";
import IconTypes from "./IconTypes";
import { IconRenderer } from "../../utilities";

const RenderStatusIcon = ({ icon, iconColor, progress, tooltip, description }) => (
  <IconRenderer
    icon={icon}
    className={`ml-1 first-line:${progress < 100 && icon === IconTypes.ACTIVE && "animate-pulse"} ${iconColor}`}
    style={{ fontSize: 14 }}
    tooltip={tooltip}
    description={description}
  />
);

function NodeFooter({ id, progress, type, status, label }) {
  const iconType = IconTypes[status];
  const iconColor = IconColors[status];
  const iconTooltip = `Test ${NodeTypes.SCENARIO_TASK === type ? "scenario" : "case"} is ${status}`;

  return (
    <div className="flex flex-col items-center">
      <div className="inline-flex justify-between items-center px-0.5">
        {label && <span className="break-words text-xs font-medium">{label}</span>}
        <RenderStatusIcon icon={iconType} iconColor={iconColor} progress={progress} tooltip={label} description={iconTooltip} />
      </div>
      <label className="text-[10px]">{id}</label>
    </div>
  );
}

export default NodeFooter;
