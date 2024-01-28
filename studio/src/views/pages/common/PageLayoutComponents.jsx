import { useContext } from "react";

import WebContext from "../../context/WebContext";

const BODY_PADDING = 45;

export function PageHeader({ show = true, children }) {
  if (!show) return null;
  return (
    <div className="sticky top-0 p-1 bg-white border border-slate-300 rounded-b-[3px] flex justify-between items-center text-color-0700">
      {children}
    </div>
  );
}

export function PageTitle({ children }) {
  return <div className="text-color-0700 text-sm font-medium select-none ml-2 grow inline-flex items-center">{children}</div>;
}

export function PageActions({ children }) {
  return <div className="flex flex-row items-center justify-end grow">{children}</div>;
}

export function Page({ children, className = "" }) {
  const { windowDimension } = useContext(WebContext);
  return (
    <div
      className={`h-full w-full flex flex-col ${className}`}
      style={{ minHeight: windowDimension?.maxContentHeight, maxHeight: windowDimension?.maxContentHeight }}
    >
      {children}
    </div>
  );
}

export function PageBody({ className = "", scrollable = true, children, fullScreen = false }) {
  const { windowDimension } = useContext(WebContext);
  const padding = fullScreen ? 10 : BODY_PADDING;
  return (
    <div
      className={`w-full mt-1 bg-white border border-slate-300 rounded-[3px] p-0.5 ${scrollable ? "overflow-y-scroll custom-scrollbar" : "overflow-hidden"
        } ${className}`}
      style={{ minHeight: windowDimension?.maxContentHeight - padding, maxHeight: windowDimension?.maxContentHeight - padding }}
    >
      {children}
    </div>
  );
}
