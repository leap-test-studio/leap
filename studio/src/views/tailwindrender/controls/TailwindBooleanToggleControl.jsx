import { isBooleanControl, rankWith, optionIs, and } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

import LabelRenderer from "../renderers/common/LabelRenderer";
import TailwindToggleRenderer from "../renderers/TailwindToggleRenderer";

const TailwindBooleanToggle = (props) => {
  if (!props.visible) return null;
  return (
    <div className="flex flex-row items-center rounded bg-white hover:bg-color-0050 hover:border grow px-2 py-1">
      <div className="px-2">
        <TailwindToggleRenderer {...props} />
      </div>
      {props.label?.length > 0 && <LabelRenderer {...props} fontSize="12px" />}
    </div>
  );
};

export const tailwindBooleanToggleControlTester = rankWith(1003, and(isBooleanControl, optionIs("toggle", true)));

export const TailwindBooleanToggleControl = withJsonFormsControlProps(TailwindBooleanToggle);
