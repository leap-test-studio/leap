import { IconRenderer } from "./iconrenderer";
import { Tooltip } from "./Tooltip";

export const RoundedIconButton = ({ id, icon, size, color, tooltip, onClick }) => (
  <Tooltip title={tooltip}>
    <button
      id={id}
      className={`inline-flex items-center justify-center w-6 h-6 mr-1 text-white transition-colors duration-150 ${color} rounded-full focus:shadow-outline hover:opacity-90`}
    >
      <IconRenderer icon={icon} fontSize={size} onClick={onClick} />
    </button>
  </Tooltip>
);
