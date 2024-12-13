import React from "react";
import { Cron } from "react-js-cron";
import "react-js-cron/dist/styles.css";
import ErrorMessage from "./common/ErrorMessage";
import LabelRenderer from "./common/LabelRenderer";

const TailwindCronRenderer = React.memo((props) => {
  const { id, visible, enabled, path, label, errors, handleChange, data } = props;

  if (!visible) return null;

  const value = data || "0 0 * * *";

  const onChange = (val) => {
    handleChange(path, val);
  };
  return (
    <div className="grow mb-1 mx-1 select-none">
      {label?.length > 0 && <LabelRenderer {...props} />}

      <Cron id={id} value={value} setValue={onChange} readOnly={!enabled} clearButton={false} />
      <ErrorMessage id={id} path={path} errors={errors} />
    </div>
  );
});

export default TailwindCronRenderer;
