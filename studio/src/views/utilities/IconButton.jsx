import { useState } from "react";
import IconRenderer from "../IconRenderer";

export default function IconButton({
  id,
  onClick,
  icon,
  title,
  disabled = false,
  ariaLabel,
  className = "text-color-0400 hover:text-color-0300 my-1",
  bg = "bg-gradient-to-b from-color-0900 to-color-0800 hover:bg-color-0700",
  iconSize = "16",
  showShadow = true,
  defaultShowTitle = true,
  color
}) {
  const [showTitle, setShowTitle] = useState(defaultShowTitle);
  const toggleShowTitle = () => {
    if (!defaultShowTitle) {
      setShowTitle(!showTitle);
    }
  };

  return (
    <button
      id={id}
      disabled={disabled}
      className={`${ariaLabel === undefined ? (disabled ? "bg-slate-300 hover:bg-slate-200" : bg) : ""} rounded text-white ${
        title !== undefined ? "px-1" : ""
      } mx-2 ${showShadow ? "shadow hover:shadow-xl" : ""} inline-flex items-center justify-center`}
      onClick={onClick}
      onMouseEnter={toggleShowTitle}
      onMouseLeave={toggleShowTitle}
    >
      <IconRenderer icon={icon} className={className} style={{ fontSize: iconSize, color: color && !disabled ? color : "" }} />
      {title !== undefined && showTitle === true && <span className="px-2 py-0.5 text-xs select-none">{title}</span>}
    </button>
  );
}
