import React from "react";
import merge from "lodash/merge";
import { Switch } from "@headlessui/react";

/**
 * Default renderer for a boolean toggle.
 */
const TailwindToggleRenderer = ({ data, uischema, path, handleChange, config, visible, enabled }) => {
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
      className={`mx-2 group relative flex h-5 w-10 cursor-pointer rounded-full bg-gray-300 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-color-0300`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block size-3 translate-x-0 rounded-full ${checked ? " bg-color-0600" : "bg-white border"} ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-5`}
      />
    </Switch>
  );
};

export default TailwindToggleRenderer;
