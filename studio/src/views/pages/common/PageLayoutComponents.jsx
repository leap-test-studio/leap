import { useContext } from "react";

import WebContext from "../../context/WebContext";

const BODY_PADDING = 50;

export function PageHeader({ show = true, children }) {
  if (!show) return null;
  return <div className="sticky top-0 p-2 mt-1 flex justify-between items-center">{children}</div>;
}

export function PageTitle({ children }) {
  return <div className="text-color-label text-base font-medium select-none ml-2 grow inline-flex items-center">{children}</div>;
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
  const padding = fullScreen ? 15 : BODY_PADDING;
  return (
    <div
      className={`w-full px-2 rounded-t-lg ${scrollable ? "overflow-y-scroll custom-scrollbar" : "overflow-hidden"} ${className}`}
      style={{ minHeight: windowDimension?.maxContentHeight - padding, maxHeight: windowDimension?.maxContentHeight - padding }}
    >
      {children}
    </div>
  );
}
