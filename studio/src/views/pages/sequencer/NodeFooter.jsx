import IconColors from "./IconColors";
import { NodeTypes } from "./Constants";
import IconTypes from "./IconTypes";
import { IconRenderer, Tooltip } from "../../utilities";

const RenderStatusIcon = ({ icon, iconColor, progress, tooltip, description }) => (
  <IconRenderer
    icon={icon}
    className={`mb-0.5 first-line:${progress < 100 && icon === IconTypes.ACTIVE && "animate-pulse"} ${iconColor}`}
    style={{ fontSize: 13 }}
    tooltip={tooltip}
    description={description}
  />
);

function NodeFooter({ id, progress, type, status, label, tags = [], tooltip }) {
  const iconType = IconTypes[status];
  const iconColor = IconColors[status];
  const iconTooltip = `Test ${NodeTypes.SCENARIO_TASK === type ? "Scenario" : "Case"} is ${status}`;
  return (
    <div className="absolute flex flex-col items-center -bottom-10 w-56">
      <div className="flex flex-row justify-between items-center px-0.5">
        {label && (
          <Tooltip title={tooltip}>
            <span className="break-words text-[11px] font-medium mr-1">{label}</span>
          </Tooltip>
        )}
        <RenderStatusIcon icon={iconType} iconColor={iconColor} progress={progress} tooltip={label} description={iconTooltip} />
      </div>
      <div className="flex flex-col items-center">
        {tags?.length > 0 ? (
          tags.map((tag, index) => (
            <label key={index} className="text-[8px] text-blue-600 select-all">
              #{tag}
            </label>
          ))
        ) : (
          <label className="text-[10px]">#{id}</label>
        )}
      </div>
    </div>
  );
}

export default NodeFooter;
