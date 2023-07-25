import React from "react";
import LabelRenderer from "./common/LabelRenderer";
const TailwindCheckbox = React.memo((props) => {
  return (
    <>
      {props.visible && (
        <div
          className={`flex flex-row mt-4 h-8 items-center border border-slate-100 rounded mb-2 w-full ${props.enabled ? "bg-white" : "bg-slate-100"}`}
        >
          <input
            disabled={!props.enabled}
            type="checkbox"
            name={props.path}
            id={props.id}
            className="text-color-0800 rounded mx-2"
            placeholder={props.description}
            checked={Boolean(props.data)}
            onChange={(_ev, isChecked) => props.handleChange(props.path, isChecked)}
          />
          {props.label?.length > 0 && <LabelRenderer {...props} fontSize="12px" />}
        </div>
      )}
    </>
  );
});

export default TailwindCheckbox;
