import React from "react";
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
  return (
    <>
      {props.visible && (
        <div className="grow mb-1.5 mx-1">
          {props.label?.length > 0 && <LabelRenderer {...props} />}
          <input
            disabled={!props.enabled}
            type="number"
            step={props.step}
            name={props.path}
            onWheel={(ev) => ev.target.blur()}
            id={props.id}
            autoComplete="off"
            className={`text-sm caret-slate-300 block px-1.5 py-0.5 rounded border placeholder-slate-500 shadow focus:shadow-md ${
              !props.enabled && "bg-slate-200"
            } ${isError ? "focus:border-red-500 border-red-600" : "focus:border-color-0600 border-slate-200"} focus:outline-none w-full`}
            placeholder={props.description}
            value={props.data}
            onChange={(ev) => {
              ev.preventDefault();
              props.handleChange(props.path, Parse(props.step, ev.target.value));
            }}
          />

          {isError && <ErrorMessage {...props} />}
        </div>
      )}
    </>
  );
});

export default TailwindNumeric;
