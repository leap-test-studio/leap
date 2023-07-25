import { useState, useEffect, createRef, useCallback } from "react";
import Centered from "./Centered";
import SearchComponent from "./SearchComponent";
import IconRenderer from "../IconRenderer";
import TailwindSelectRenderer from "../tailwindrender/renderers/TailwindSelectRenderer";
import TailwindToggleRenderer from "../tailwindrender/renderers/TailwindToggleRenderer";
import dayjs from "dayjs";
import isEmpty from "lodash/isEmpty";
import OnlineIndicator from "../pages/common/OnlineIndicator";
import Tooltip from "./Tooltip";

const LogLevels = [
  { id: 0, label: "ALL", value: 0, icon: "CheckBox", color: "text-slate-300" },
  { id: 1, label: "TRACE", value: 1, icon: "LogoDev", color: "text-slate-300" },
  { id: 2, label: "DEBUG", value: 2, icon: "BugReport", color: "text-cds-blue-0600" },
  { id: 3, label: "INFO", value: 3, icon: "Info", color: "text-cds-blue-0400" },
  { id: 4, label: "WARN", value: 4, icon: "Warning", color: "text-yellow-400" },
  { id: 5, label: "ERROR", value: 5, icon: "Error", color: "text-cds-red-0600" },
  { id: 6, label: "FATAL", value: 6, icon: "Report", color: "text-red-900" }
];

export default function ConsoleOutputComponent({ title = "Console log", online, logs, showCloseBtn, onClose, showFilename = false, onClear }) {
  const messagesEndRef = createRef();
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState(0);
  const [darkMode, setDarkMode] = useState(true);

  const scrollToBottom = useCallback(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesEndRef]);

  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  let eventlogs = [];
  if (search != null && search.trim().length > 0) {
    eventlogs = logs.filter((e) => e.message.includes(search));
  } else {
    eventlogs = eventlogs.concat(logs);
  }

  if (severity > 0) {
    eventlogs = eventlogs.filter((e) => e.severity === severity);
  }

  return (
    <div
      className={`w-full grow max-w-full h-full flex flex-col rounded-md border pb-2 ${
        darkMode ? "bg-black text-cds-blue-0500" : "bg-white text-color-0500"
      }`}
    >
      <div className="px-4 sm:px-6 bg-slate-100 py-1 rounded-t">
        <div className={`flex flex-row items-center justify-between w-full text-xs ${darkMode ? "text-color-0500" : "text-color-0500"}`}>
          <div className="inline-flex items-center">
            <Tooltip title="Listening for Console log events">
              <OnlineIndicator id="console-indicator" online={online} />
            </Tooltip>
            <span className="ml-4">{title}</span>
            <div className="w-80 mr-5">
              <SearchComponent search={search} onChange={(value) => setSearch(value)} onClear={() => setSearch("")} />
            </div>
          </div>
          <div className="inline-flex items-center">
            <span className="ml-4 mr-2">Log Level</span>
            <div className="w-32">
              <TailwindSelectRenderer
                id="type"
                path="type"
                label={null}
                options={LogLevels}
                data={severity}
                handleChange={(_, ev) => setSeverity(ev)}
              />
            </div>
          </div>
          {onClear && (
            <Tooltip title="Clear all logs from this console">
              <p className="inline-flex underline text-xs font-medium text-blue-500 cursor-pointer" onClick={onClear}>
                Clear All
              </p>
            </Tooltip>
          )}
          <div className="inline-flex items-center">
            <span className="mr-1">Dark Mode</span>
            <TailwindToggleRenderer path="mode" visible={true} enabled={true} data={darkMode} handleChange={(_, ev) => setDarkMode(ev)} />
          </div>

          {showCloseBtn && (
            <button type="button" className="rounded-md text-slate-300 hover:text-white focus:outline-none focus:ring-1" onClick={() => onClose()}>
              <span className="sr-only">Close panel</span>
              <IconRenderer icon="Close" className="h-4 w-4 text-red-500" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      {!isEmpty(eventlogs) ? (
        <div className="mt-2 relative flex-1 px-4 sm:px-6">
          {/* Replace with your content */}

          <div className="absolute inset-0 w-full wrap pl-6 pr-2 h-full overflow-y-scroll scrollbar-thin scrollbar-thumb-color-0800 scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scroll-smooth">
            {eventlogs.map((e, i) => (
              <DisplayCard id={i + 1} key={i + 1} {...e} time={Number(e.time)} showFilename={showFilename} />
            ))}
            <Skeleton messagesEndRef={messagesEndRef} showFilename={showFilename} />
          </div>
          {/* /End replace */}
        </div>
      ) : (
        <Centered>No {title}</Centered>
      )}
    </div>
  );
}

function DisplayCard({ time, message, severity, fileName, showFilename }) {
  const timeMs = new Date(time > 0 ? time : Date.now()).getTime();
  const level = LogLevels.find((l) => l.label === severity || l.value === severity) || LogLevels[0];
  return (
    <div className={`text-xs flex lg:flex-row md:flex-col sm:flex-col items-center font-semibold ${level.color}`}>
      <IconRenderer icon={level.icon} fontSize="16" className="mx-1" />
      <p className="w-40 break-words mx-1 select-all">{dayjs(timeMs).format("YYYY-MM-DD HH:mm:ss")}</p>
      {showFilename && <p className="w-52 break-all mx-1 select-all">{fileName}</p>}
      <p className="leading-snug tracking-wide text-opacity-100 w-full break-all mx-1 select-all">{message}</p>
    </div>
  );
}

function Skeleton({ messagesEndRef, showFilename }) {
  return (
    <div ref={messagesEndRef} className="mt-1 flex lg:flex-row md:flex-col sm:flex-col">
      <div className="bg-slate-200 h-2.5 w-3 animate-pulse rounded-full mx-1" />
      <div className="bg-slate-200 h-2.5 w-40 animate-pulse rounded-2xl mx-1" />
      {showFilename && <div className="bg-slate-200 h-3 w-52 animate-pulse rounded-2xl mx-1" />}
      <div className="bg-slate-200 h-2.5 w-full animate-pulse rounded-2xl mx-1" />
    </div>
  );
}
