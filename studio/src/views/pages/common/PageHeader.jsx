import WebContext from "../../context/WebContext";
import { useContext } from "react";

function PageHeader({ show = true, children }) {
  if (!show) return null;
  return <div className="sticky top-0 p-1 bg-slate-100 border rounded-b flex justify-between items-center text-color-0700">{children}</div>;
}

export default PageHeader;

export function PageTitle({ children }) {
  return <div className="text-color-0700 w-60 font-medium select-none ml-2 grow inline-flex items-center">{children}</div>;
}

export function PageActions({ children }) {
  return <div className="inline-flex items-center justify-end grow">{children}</div>;
}
export function Page({ children }) {
  const { windowDimension } = useContext(WebContext);
  return (
    <div className="flex flex-col w-full" style={{ minHeight: windowDimension?.maxContentHeight }}>
      {children}
    </div>
  );
}

export function PageBody({ className, children }) {
  const { windowDimension } = useContext(WebContext);
  return (
    <div
      className={`flex flex-col mt-2 mb-1 shadow rounded border-2 bg-slate-100 ${className} overflow-y-scroll scrollbar-thin scrollbar-thumb-color-0800 scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full`}
      style={{ minHeight: windowDimension?.maxContentHeight - 55, maxHeight: windowDimension?.maxContentHeight - 55 }}
    >
      {children}
    </div>
  );
}
