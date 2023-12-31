import React from "react";
import LabelRenderer from "./common/LabelRenderer";

/**
 * Default renderer for a checkbox/boolean.
 */
const TailwindCheckboxRenderer = React.memo((props) => {
  return (
    <>
      {props.visible && (
        <div
          className={`my-0.5 flex flex-row ${Boolean(props.removeMt) ? "mb-2" : "mt-1"} min-h-[35px] items-center border border-slate-200 rounded ${
            props.enabled ? "bg-white" : "opacity-70 bg-slate-200"
          } shadow grow mx-1`}
        >
          <input
            disabled={!props.enabled}
            type="checkbox"
            name={props.path}
            id={props.id}
            className={`text-color-0500 ring-blue-500 rounded mx-2 ${!props.enabled && "bg-slate-200"}`}
            placeholder={props.description}
            checked={props.data == undefined ? props.schema.default : Boolean(props.data)}
            onChange={(ev) => props.handleChange(props.path, ev.target.checked)}
          />
          {props.label?.length > 0 && <LabelRenderer {...props} fontSize="12px" />}
        </div>
      )}
    </>
  );
});

export default TailwindCheckboxRenderer;
