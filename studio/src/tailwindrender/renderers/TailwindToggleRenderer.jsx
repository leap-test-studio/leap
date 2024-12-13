import React from "react";
import merge from "lodash/merge";
import { Switch } from "@headlessui/react";

/**
 * Default renderer for a boolean toggle.
 */
const TailwindToggleRenderer = React.memo(({ data, uischema, path, handleChange, config, visible, enabled }) => {
  const appliedUiSchemaOptions = merge({}, config, uischema?.options);
  const inputProps = { autoFocus: !!appliedUiSchemaOptions.focus };
  const checked = data == true;

  if (!visible) return null;

  return (
    <Switch
      id={`${path}-toggle`}
      autoFocus={inputProps.autoFocus}
      name={path}
      checked={checked}
      disabled={!enabled}
      onChange={(ev) => {
        if (!enabled) return;
        handleChange(path, ev);
      }}
      className={`group relative flex h-5 w-10 cursor-pointer rounded-full bg-gray-300 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white ${enabled ? "data-[checked]:bg-color-0300" : "cursor-not-allowed"} z-auto`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block size-3 translate-x-0 rounded-full ${checked ? (enabled ? "bg-color-0600" : "bg-slate-500") : "bg-white border"} ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5`}
      />
    </Switch>
  );
});

export default TailwindToggleRenderer;
