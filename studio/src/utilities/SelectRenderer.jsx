import { useEffect } from "react";
import ReactSelect from "react-select";
import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";

import LabelRenderer from "@tailwindrender/renderers/common/LabelRenderer";
import ErrorMessage from "@tailwindrender/renderers/common/ErrorMessage";

export const SelectRenderer = ({
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

  const ReactSelectCustomStyles = {
    container: (base) => ({
      ...base,
      flex: 1
    }),
    control: (styles) => ({
      ...styles,
      minWidth: props.width,
      boxShadow: "none",
      minHeight: 30,
      height: 30,
      outline: "none",
      cursor: "pointer",
      border: "1.5px solid #CBD5E1",
      "&:hover": {
        border: "1.5px solid #f7f3ff !important"
      }
    }),
    menuPortal: (base) => ({ ...base, zIndex: 100000 }),
    menu: (base) => ({ ...base, width: "auto", minWidth: "40%", zIndex: 100000 }),
    menuList: (base) => ({
      ...base,
      fontSize: 12,
      "::-webkit-scrollbar": {
        width: "8px",
        height: "0px"
      },
      "::-webkit-scrollbar-track": {
        background: "#f1f1f1"
      },
      "::-webkit-scrollbar-thumb": {
        background: "#6d48bf"
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: "#555"
      }
    }),
    valueContainer: (styles) => ({
      ...styles,
      fontSize: 14,
      paddingTop: 3,
      paddingBottom: 5
    }),
    option: (base, { isSelected }) => ({
      ...base,
      backgroundColor: isSelected ? "#6d48bf" : "",
      color: isSelected ? "white" : "",
      ":active": {
        backgroundColor: "#6d48bf"
      },
      ":hover": {
        backgroundColor: "#f7f3ff",
        color: "#fff"
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: "rgb(100 116 139)",
      fontSize: 14
    }),
    input: (base) => ({
      ...base,
      border: "none",
      fontSize: 14,
      borderStyle: "none",
      paddingTop: 0,
      paddingBottom: 0
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: 2,
      paddingTop: 0,
      paddingBottom: 0
    })
  };

  useEffect(() => {
    if (data === undefined && props.schema?.default !== undefined) {
      onChange(options?.find((item) => item.value === props.schema?.default));
    }
  }, [data]);

  if (!visible) return null;

  return (
    <div id={id} className={`mx-1 ${className}`}>
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
};
