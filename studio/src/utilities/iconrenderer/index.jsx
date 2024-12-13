import loadable from "react-loadable";
import { Tooltip } from "../Tooltip";
import MuiIcons from "./MuiIcons";

const HourGlass = ({ className }) => (
  <svg width="16" height="16" className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 22L17.99 16L14 12L17.99 7.99L18 2H6V8L10 12L6 15.99V22H18ZM8 7.5V4H16V7.5L12 11.5L8 7.5Z" fill="#AEAEAE" />
  </svg>
);

const MuiIconsLazy = loadable({
  loader: () => {
    return import("./MuiIcons");
  },
  loading: () => <HourGlass className="opacity-50" />
});

export const IconRenderer = ({ tooltip, description, ...props }) => (
  <Tooltip title={tooltip} content={description}>
    <MuiIcons {...props} />
  </Tooltip>
);
