import React, { useEffect } from "react";
import merge from "lodash/merge";

import ErrorMessage from "./ErrorMessage";
import LabelRenderer from "./LabelRenderer";

function Parse(step, data) {
  if (data === undefined) return 0;
  return step === 0.1 ? parseFloat(data) : parseInt(data);
}
/**
 * Default renderer for a number/integer.
 */
const TailwindNumeric = React.memo((props) => {
  const isError = props.errors?.length > 0;
  const { id, visible, enabled, path, description, uischema, data, handleChange, label, step } = props;
  const { resetTo } = merge({}, uischema.options);

  useEffect(() => {
    if (!enabled && resetTo != null && data != resetTo) {
      handleChange(path, Number(resetTo));
    }
  }, [enabled, data, resetTo]);

  return (
    <>
      {visible && (
        <div className="grow mb-1 mx-1">
          {label?.length > 0 && <LabelRenderer {...props} />}
          <input
            id={id}
            name={path}
            type="number"
            step={step}
            disabled={!enabled}
            value={data}
            placeholder={description}
            onWheel={(ev) => ev.target.blur()}
            autoComplete="off"
            className={`text-xs caret-slate-300 block px-1.5 py-1 rounded border placeholder-slate-500 shadow focus:shadow-md ${!props.enabled && "bg-slate-200"
              } ${isError ? "focus:border-red-500 border-red-600" : "focus:border-color-0600 border-slate-300"} focus:outline-none w-full`}
            onChange={(ev) => {
              ev.preventDefault();
              handleChange(path, Parse(step, ev.target.value));
            }}
          />

          {isError && <ErrorMessage {...props} />}
        </div>
      )}
    </>
  );
});

export default TailwindNumeric;
