import React, { useEffect } from "react";
import merge from "lodash/merge";

import LabelRenderer from "./common/LabelRenderer";

/**
 * Default renderer for a checkbox/boolean.
 */
const TailwindCheckboxRenderer = React.memo((props) => {
  const { id, visible, enabled, path, description, uischema, data, handleChange, label, schema, removeMt } = props;
  const { resetTo } = merge({}, uischema.options);

  useEffect(() => {
    if (!enabled && resetTo != null && data != resetTo) {
      handleChange(path, Boolean(resetTo));
    }
  }, [enabled, data, resetTo]);

  if (!visible) return null;

  return (
    <div
      className={`my-0.5 flex flex-row ${Boolean(removeMt) ? "mb-2" : "mt-1"} min-h-[35px] items-center border border-slate-300 rounded ${
        enabled ? "bg-white" : "opacity-70 bg-slate-200"
      } shadow grow mx-1`}
    >
      <input
        id={id}
        disabled={!enabled}
        type="checkbox"
        name={path}
        className={`text-color-0500 ring-blue-500 rounded mx-2 ${!enabled && "bg-slate-200"}`}
        placeholder={description}
        checked={data == undefined ? schema.default : Boolean(data)}
        onChange={(ev) => handleChange(path, ev.target.checked)}
      />
      {label?.length > 0 && <LabelRenderer {...props} fontSize="12px" />}
    </div>
  );
});

export default TailwindCheckboxRenderer;
