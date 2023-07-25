import { and, isIntegerControl, optionIs, rankWith } from "@jsonforms/core";
import { withJsonFormsControlProps } from "@jsonforms/react";
import LabelRenderer from "../renderers/common/LabelRenderer";
import { convertMsToHM } from "../util/converter";

function TailwindTimeInteger({ visible, path, data, handleChange, ...props }) {
  const obj = convertMsToHM(data || 0);
  return (
    <>
      {visible && (
        <div className="grid grid-cols-4 gap-2 items-center px-2">
          <LabelRenderer fontSize="14px" path={path} {...props} />
          <div>
            <LabelRenderer path={path} label="Hour(s)" description="Select Hour(s)" />
            <input
              type="number"
              step={1}
              name={path + ":Hours"}
              id={path + ":Hours"}
              onWheel={(ev) => ev.target.blur()}
              autoComplete="off"
              className={`text-sm caret-slate-300 block px-1.5 py-0.5 rounded border placeholder-slate-500 shadow focus:shadow-md focus:border-color-0600 border-slate-200 focus:outline-none w-full ${
                !props.enabled && "bg-slate-200"
              }`}
              value={obj.hours}
              disabled={!props.enabled}
              onChange={(ev) => {
                ev.preventDefault();
                const value = Number(ev.target.value);
                if (value >= 0 && value < 24) {
                  const sec = value * 60 * 60 + obj.minutes * 60 + obj.seconds;
                  handleChange(path, Number(sec) * 1000);
                }
              }}
            />
          </div>
          <div>
            <LabelRenderer path={path} label="Minute(s)" description="Select Minute(s)" />
            <input
              type="number"
              step={1}
              name={path + ":Minutes"}
              id={path + ":Minutes"}
              onWheel={(ev) => ev.target.blur()}
              autoComplete="off"
              className={`text-sm caret-slate-300 block px-1.5 py-0.5 rounded border placeholder-slate-500 shadow focus:shadow-md focus:border-color-0600 border-slate-200 focus:outline-none w-full ${
                !props.enabled && "bg-slate-200"
              }`}
              value={obj.minutes}
              disabled={!props.enabled}
              onChange={(ev) => {
                ev.preventDefault();
                const value = Number(ev.target.value);
                if (value >= 0 && value < 60) {
                  const sec = obj.hours * 60 * 60 + value * 60 + obj.seconds;
                  handleChange(path, Number(sec) * 1000);
                }
              }}
            />
          </div>
          <div>
            <LabelRenderer path={path} label="Second(s)" description="Select Second(s)" />
            <input
              type="number"
              step={1}
              name={path + ":Seconds"}
              id={path + ":Seconds"}
              autoComplete="off"
              onWheel={(ev) => ev.target.blur()}
              className={`text-sm caret-slate-300 block px-1.5 py-0.5 rounded border placeholder-slate-500 shadow focus:shadow-md focus:border-color-0600 border-slate-200 focus:outline-none w-full ${
                !props.enabled && "bg-slate-200"
              }`}
              value={obj.seconds}
              disabled={!props.enabled}
              onChange={(ev) => {
                ev.preventDefault();
                const value = Number(ev.target.value);
                if (value >= 0 && value < 60) {
                  const sec = obj.hours * 60 * 60 + obj.minutes * 60 + value;
                  handleChange(path, Number(sec) * 1000);
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export const tailwindTimeIntegerControlTester = rankWith(2001, and(isIntegerControl, optionIs("format", "time")));

export const TailwindTimeIntegerControl = withJsonFormsControlProps(TailwindTimeInteger);
