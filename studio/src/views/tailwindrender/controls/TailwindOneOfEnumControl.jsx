import { useEffect } from "react";
import ReactSelect from "react-select";
import { isOneOfEnumControl, rankWith } from "@jsonforms/core";
import { withJsonFormsOneOfEnumProps } from "@jsonforms/react";

import LabelRenderer from "../renderers/common/LabelRenderer";
import { ReactSelectCustomStyles } from "../common/Constants";

export const TailwindOneOfEnum = (props) => {
  const { id, handleChange, path, visible, label, options, data, schema } = props;
  const handleSelectChange = (selectedOption) => {
    if (selectedOption) {
      handleChange(path, selectedOption.value);
    }
  };

  useEffect(() => {
    if (data === undefined && schema?.default !== undefined) {
      handleSelectChange(options?.find((item) => item.value === schema.default));
    }
  }, [data]);

  if (!visible) return null;

  return (
    <div className="mx-1">
      {label?.length > 0 && <LabelRenderer {...props} />}
      <ReactSelect
        id={id}
        value={options.find((option) => option.value === data)}
        onChange={(option) => handleSelectChange(option)}
        options={options}
        isSearchable={true}
        className="rounded border text-color-label placeholder-slate-500"
        styles={ReactSelectCustomStyles}
        menuPosition="absolute"
        menuPlacement="auto"
        menuPortalTarget={document.body}
      />
    </div>
  );
};

export const tailwindOneOfEnumControlTester = rankWith(1005, isOneOfEnumControl);

export const TailwindOneOfEnumControl = withJsonFormsOneOfEnumProps(TailwindOneOfEnum);
