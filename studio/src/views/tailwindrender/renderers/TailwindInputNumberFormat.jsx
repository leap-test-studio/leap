import React, { useCallback } from "react";
import Input from "@mui/material/Input";
import merge from "lodash/merge";

import { useDebouncedChange } from "../util";

export const TailwindInputNumberFormat = React.memo((props) => {
  const { className, id, enabled, uischema, isValid, path, handleChange, schema, config } = props;
  const maxLength = schema.maxLength;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  let inputProps;
  if (appliedUiSchemaOptions.restrict) {
    inputProps = { maxLength: maxLength };
  } else {
    inputProps = {};
  }
  const formattedNumber = props.toFormatted(props.data);

  const validStringNumber = useCallback((ev) => props.fromFormatted(ev.currentTarget.value), [props]);
  const [inputValue, onChange] = useDebouncedChange(handleChange, "", formattedNumber, path, validStringNumber);

  return (
    <Input
      type="text"
      value={inputValue || ""}
      onChange={onChange}
      className={className}
      id={id}
      disabled={!enabled}
      autoFocus={appliedUiSchemaOptions.focus}
      multiline={appliedUiSchemaOptions.multi}
      fullWidth={!appliedUiSchemaOptions.trim || maxLength === undefined}
      inputProps={inputProps}
      error={!isValid}
    />
  );
});
