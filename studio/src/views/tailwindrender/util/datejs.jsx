import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
const INVALID_DATE = "Invalid Date";

export const createOnChangeHandler = (path, handleChange, saveFormat) => (time) => {
  const result = dayjs(time).format(saveFormat);
  handleChange(path, result === INVALID_DATE ? undefined : result);
};

export const getData = (data, saveFormat) => {
  if (!(data instanceof Date) && isEmpty(data)) return null;
  const date = data instanceof Date ? data : new Date(data);
  const dayjsData = dayjs(date);
  if (dayjsData.toString() === INVALID_DATE) {
    return "";
  }
  return new Date(dayjsData.format(saveFormat));
};
