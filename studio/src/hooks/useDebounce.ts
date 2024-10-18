import { useState, useCallback, useEffect } from "react";

const eventToValue = (ev: any) => ev.target?.value;

export const useDebouncedChange = (
  handleChange: (value: any) => void,
  defaultValue: any,
  data: any,
  timeout = 1000,
  eventToValueFunction: (ev: any) => any = eventToValue
): [any, React.ChangeEventHandler, () => void] => {
  const [input, setInput] = useState(data ?? defaultValue);
  const [timer, setTimer] = useState<any>();

  useEffect(() => () => clearTimeout(timer), [timer]);

  useEffect(() => setInput(data ?? defaultValue), [data, defaultValue]);

  const debouncedUpdate = useCallback((newValue: any) => {
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => handleChange(newValue), timeout));
    return () => {
      clearTimeout(timer);
      setTimer(null);
    };
  }, []);

  const onChange = useCallback(
    (ev: any) => {
      const newValue = eventToValueFunction(ev);
      setInput(newValue ?? defaultValue);
      debouncedUpdate(newValue);
    },
    [debouncedUpdate, eventToValueFunction, defaultValue]
  );
  const onClear = useCallback(() => {
    setInput(defaultValue);
    handleChange(defaultValue);
  }, [defaultValue, handleChange]);
  return [input, onChange, onClear];
};
