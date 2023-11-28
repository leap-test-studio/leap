import React from "react";
import Tooltip from "../../../utilities/Tooltip";
import IconRenderer from "../../../IconRenderer";

const LabelRenderer = React.memo(({ path, label, fontSize, description, ...props }) => {
  return (
    <div htmlFor={path} className="flex items-center text-[10px] font-medium text-color-0500 select-none mr-2">
      <div className="flex">
        <label style={{ fontSize: fontSize !== undefined ? fontSize : "10px" }}>{label}</label>
        {showAsRequired(props) && <label className="text-red-500 items-center">*</label>}
      </div>
      {description && (
        <Tooltip title={description}>
          <IconRenderer icon="HelpOutlined" fontSize="8px" className="pb-0.5 ml-1" />
        </Tooltip>
      )}
    </div>
  );
});

export default LabelRenderer;

function showAsRequired(props) {
  return props?.required && !props?.config?.hideRequiredAsterisk;
}
