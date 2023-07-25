import { Fragment, useState } from "react";
import IconRenderer from "../IconRenderer";
import { Transition } from "@headlessui/react";

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
      } mx-2 ${showShadow ? "shadow hover:shadow-xl" : ""}`}
      onClick={onClick}
      onMouseEnter={toggleShowTitle}
      onMouseLeave={toggleShowTitle}
    >
      <div className="flex flex-row items-center justify-center">
        <IconRenderer icon={icon} className={className} style={{ fontSize: iconSize, color: color && !disabled ? color : "" }} />
        <Transition appear={true} show={title !== undefined && showTitle === true} as={Fragment}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-[300ms]"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-[500ms]"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <span className="px-2 py-0.5 text-sm select-none">{title}</span>
          </Transition.Child>
        </Transition>
      </div>
    </button>
  );
}
