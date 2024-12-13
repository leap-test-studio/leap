import { E_NODE_STATE } from "engine_utils";
import { IconRenderer } from "@utilities/.";
import { IconColors, IconTypes } from "../Constants";

const RenderStatusIcon = ({ status, progress, tooltip, description }) => {
  const iconType = IconTypes[status];
  const iconColor = IconColors[status];
  return (
    <IconRenderer
      icon={iconType}
      className={`mb-0.5 ${progress < 100 && status === E_NODE_STATE.ACTIVE && "animate-pulse"} ${iconColor}`}
      style={{ fontSize: 16 }}
      tooltip={tooltip}
      description={description}
    />
  );
};

export default RenderStatusIcon;
