import React, { useMemo } from "react";
import merge from "lodash/merge";
import { isTimeControl, isDescriptionHidden, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import TimePicker from "@mui/lab/TimePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterDayjs from "@mui/lab/AdapterDayjs";
import { createOnChangeHandler, getData, useFocus } from "../util";

const TailwindTime = (props) => {
  const [focused, onFocus, onBlur] = useFocus();
  const { id, description, errors, label, uischema, visible, enabled, required, path, handleChange, data, config } = props;
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  const isValid = errors.length === 0;

  const showDescription = !isDescriptionHidden(visible, description, focused, appliedUiSchemaOptions.showUnfocusedDescription);

  const format = appliedUiSchemaOptions.timeFormat ?? "HH:mm";
  const saveFormat = appliedUiSchemaOptions.timeSaveFormat ?? "HH:mm:ss";

  const firstFormHelperText = showDescription ? description : !isValid ? errors : null;
  const secondFormHelperText = showDescription && !isValid ? errors : null;

  const onChange = useMemo(() => createOnChangeHandler(path, handleChange, saveFormat), [path, handleChange, saveFormat]);

  return (
    <>
      {visible && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            label={label}
            value={getData(data, saveFormat)}
            clearable
            onChange={onChange}
            inputFormat={format}
            disableMaskedInput
            ampm={!!appliedUiSchemaOptions.ampm}
            views={appliedUiSchemaOptions.views}
            disabled={!enabled}
            cancelText={appliedUiSchemaOptions.cancelLabel}
            clearText={appliedUiSchemaOptions.clearLabel}
            okText={appliedUiSchemaOptions.okLabel}
            renderInput={(params) => (
              <TextField
                {...params}
                id={id + "-input"}
                required={required && !appliedUiSchemaOptions.hideRequiredAsterisk}
                autoFocus={appliedUiSchemaOptions.focus}
                error={!isValid}
                fullWidth={!appliedUiSchemaOptions.trim}
                inputProps={{ ...params.inputProps, type: "text" }}
                InputLabelProps={data ? { shrink: true } : undefined}
                onFocus={onFocus}
                onBlur={onBlur}
                variant={"standard"}
              />
            )}
          />
          <FormHelperText error={!isValid && !showDescription}>{firstFormHelperText}</FormHelperText>
          <FormHelperText error={!isValid}>{secondFormHelperText}</FormHelperText>
        </LocalizationProvider>
      )}
    </>
  );
};

export const tailwindTimeControlTester = rankWith(1004, isTimeControl);

export const TailwindTimeControl = withJsonFormsControlProps(TailwindTime);
