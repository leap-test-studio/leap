import React from "react";
import merge from "lodash/merge";

/**
 * Default renderer for a boolean toggle.
 */
const TailwindToggleRenderer = ({ data, uischema, path, handleChange, config, visible, enabled, small = false }) => {
  const appliedUiSchemaOptions = merge({}, config, uischema?.options);
  const inputProps = { autoFocus: !!appliedUiSchemaOptions.focus };
  const checked = Boolean(data);
  return (
    <>
      {visible && (
        <div className={`relative inline-block ${small ? "w-6" : "w-8"} mx-2 align-middle select-none transition duration-[300ms] ease-in`}>
          <input
            disabled={!enabled}
            autoFocus={inputProps.autoFocus}
            type="checkbox"
            name={path}
            id={`${path}-toggle`}
            className={`toggle-checkbox absolute block ${small ? "w-3 h-3" : "w-4 h-4"} -mt-0.5 rounded-full ${
              enabled ? "bg-white text-color-0500 ring-color-0500" : "bg-slate-100 text-slate-400 ring-slate-400"
            } border appearance-none cursor-pointer`}
            checked={checked}
            onChange={(ev) => {
              if (!enabled) return;
              handleChange(path, ev.target.checked);
            }}
          />
          <label
            htmlFor={`${path}-toggle`}
            className={`toggle-label block overflow-hidden ${small ? "h-2" : "h-3"} rounded-full ${
              enabled && checked ? "bg-color-0300" : "bg-gray-300"
            } cursor-pointer select-all`}
          />
        </div>
      )}
    </>
  );
};

export default TailwindToggleRenderer;
