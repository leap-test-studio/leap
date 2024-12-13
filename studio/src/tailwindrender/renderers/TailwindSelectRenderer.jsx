import React, { useEffect } from "react";
import ReactSelect from "react-select";
import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";

import LabelRenderer from "./common/LabelRenderer";
import ErrorMessage from "./common/ErrorMessage";
import { ReactSelectCustomStyles } from "../common/Constants";

const TailwindSelectRenderer = React.memo(
  ({
    id,
    path,
    visible = true,
    errors,
    enabled = true,
    label,
    data,
    handleChange,
    enableFilter = true,
    description,
    placeholder,
    showLabel = true,
    className,
    ...props
  }) => {
    const appliedUiSchemaOptions = merge({}, props.config, props.uischema?.options, props.schema?.options);
    const options = !isEmpty(props.schema?.values) ? props.schema?.values : props.options;
    const onChange = (selected) => {
      let ev;
      if (appliedUiSchemaOptions.returnIndex) {
        ev = options?.findIndex((item) => item?.value === selected.value);
      } else {
        ev = selected?.value;
      }
      handleChange(path, ev);
    };

    let selectedOption;
    if (appliedUiSchemaOptions.returnIndex) {
      selectedOption = options[data];
    } else {
      selectedOption = options?.find((item) => item.value === data);
    }

    useEffect(() => {
      if (data === undefined && props.schema?.default !== undefined) {
        onChange(options?.find((item) => item.value === props.schema?.default));
      }
    }, [data]);

    if (!visible) return null;

    return (
      <div id={id} className="mx-1">
        {showLabel && label?.length > 0 && <LabelRenderer path={path} label={label} {...props} />}
        <ReactSelect
          id={`select-${id}`}
          classNamePrefix={`twr-select-${id}`}
          placeholder={!isEmpty(label) ? label : "Select..."}
          styles={ReactSelectCustomStyles}
          isSearchable={enableFilter}
          value={selectedOption}
          onChange={onChange}
          options={options}
          isDisabled={!enabled}
          menuPortalTarget={document.body}
          menuPosition="absolute"
          menuPlacement="auto"
          required={props?.required}
        />
        {appliedUiSchemaOptions.returnIndex != null && <ErrorMessage id={id} path={path} errors={errors} />}
      </div>
    );
  }
);

export default TailwindSelectRenderer;
