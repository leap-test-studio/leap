import React from "react";
import { isRangeControl, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import LabelRenderer from "../renderers/common/LabelRenderer";
import ErrorMessage from "../renderers/common/ErrorMessage";

const TailwindSlider = React.memo((props) => {
  const { id, data, enabled, errors, label, schema, handleChange, visible, path } = props;
  return (
    <>
      {visible && (
        <div className="grow mb-1.5 mx-1">
          {label?.length > 0 && <LabelRenderer {...props} />}
          <div className="flex flex-row justify-between items-center text-xs">
            <label className="grow text-left">{schema.minimum}</label>
            <label className="grow text-center">{"Selected: " + Number(data || schema.default)}</label>
            <label className="grow text-right">{schema.maximum}</label>
          </div>
          <input
            id={id + "-input"}
            type="range"
            disabled={!enabled}
            min={schema.minimum}
            max={schema.maximum}
            value={Number(data || schema.default)}
            onChange={(ev) => handleChange(path, Number(ev.target.value))}
            className="w-full h-2 bg-color-0200 rounded-lg appearance-none cursor-pointer"
            step={schema.multipleOf || 1}
          />
          <ErrorMessage path={path} errors={errors} />
        </div>
      )}
    </>
  );
});

export const tailwindSliderControlTester = rankWith(1004, isRangeControl);

export const TailwindSliderControl = withJsonFormsControlProps(TailwindSlider);
