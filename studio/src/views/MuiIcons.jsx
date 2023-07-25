import * as MuiIcons from "@mui/icons-material";

export default function IconRenderer({ icon = "Info", className, ...props }) {
  const MyIcon = MuiIcons[icon];
  return <MyIcon {...props} className={`h-4 w-5 ${className}`} />;
}
