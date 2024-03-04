import { isBooleanControl, rankWith, optionIs, and } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";

import LabelRenderer from "../renderers/common/LabelRenderer";
import TailwindToggleRenderer from "../renderers/TailwindToggleRenderer";

const TailwindBooleanToggle = (props) => {
  if (!props.visible) return null;
  return (
    <div className="flex flex-row min-h-[35px] items-center border border-slate-300 rounded bg-white shadow focus:shadow-md grow m-1">
      <TailwindToggleRenderer {...props} />
      {props.label?.length > 0 && <LabelRenderer {...props} fontSize="12px" />}
    </div>
  );
};

export const tailwindBooleanToggleControlTester = rankWith(1003, and(isBooleanControl, optionIs("toggle", true)));

export const TailwindBooleanToggleControl = withJsonFormsControlProps(TailwindBooleanToggle);
