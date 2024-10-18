import { useState } from "react";

import { IconRenderer } from "./iconrenderer";
import { Tooltip } from "./Tooltip";

export const IconButton = ({
  id,
  onClick,
  icon,
  title,
  disabled = false,
  ariaLabel,
  className = "text-white m-1 mr-0",
  bg = "bg-color-0600 hover:bg-color-0500",
  iconSize = "16",
  showShadow = true,
  defaultShowTitle = true,
  color,
  tooltip
}) => {
  const [showTitle, setShowTitle] = useState(defaultShowTitle);
  const toggleShowTitle = () => {
    if (!defaultShowTitle) {
      setShowTitle(!showTitle);
    }
  };

  const Button = () => (
    <button
      id={id}
      disabled={disabled}
      className={`${ariaLabel === undefined ? (disabled ? "bg-slate-300 hover:bg-slate-200 cursor-not-allowed" : bg) : ""} rounded text-white ${
        title !== undefined ? "px-1" : ""
      } mr-2 ${showShadow ? "shadow hover:shadow-xl" : ""} inline-flex items-center justify-center`}
      onClick={onClick}
      onMouseEnter={toggleShowTitle}
      onMouseLeave={toggleShowTitle}
    >
      <IconRenderer icon={icon} className={className} style={{ fontSize: iconSize, color: color && !disabled ? color : "" }} />
      {title !== undefined && showTitle === true && <span className="pr-2 pl-1 py-0.5 text-xs select-none">{title}</span>}
    </button>
  );

  if (tooltip)
    return (
      <Tooltip title={tooltip}>
        <Button />
      </Tooltip>
    );
  return <Button />;
};
