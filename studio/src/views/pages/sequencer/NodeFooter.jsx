import IconColors from "./IconColors";
import IconRenderer from "../../IconRenderer";
import IconTypes from "./IconTypes";
import Tooltip from "../../utilities/Tooltip";

function NodeFooter({ progress, nodeData }) {
  const icon = nodeData?.enabled ? IconTypes.ACTIVE : IconTypes.INACTIVE;
  const iconColor = nodeData?.enabled ? IconColors.ACTIVE : IconColors.INACTIVE;
  const iconTooltip = `Test case is ${nodeData?.enabled ? "Active" : "Inactive"}`;

  return (
    <div className="inline-flex justify-between items-center p-0.5">
      {nodeData?.label && <span className="break-words text-xs font-medium">{nodeData?.label}</span>}
      <Tooltip title={nodeData?.label} content={iconTooltip}>
        <RenderStatusIcon icon={icon} iconColor={iconColor} progress={progress} />
      </Tooltip>
    </div>
  );
}

function RenderStatusIcon({ icon, iconColor, progress }) {
  return (
    <IconRenderer
      icon={icon}
      className={`ml-1 first-line:${progress < 100 && icon === IconTypes.ACTIVE && "animate-pulse"} ${iconColor}`}
      style={{ fontSize: "12" }}
    />
  );
}

export default NodeFooter;
