function PageHeader({ children }) {
  return <div className="sticky top-0 p-1 bg-slate-100 border rounded-b flex justify-between items-center text-color-0700">{children}</div>;
}

export default PageHeader;

export function PageTitle({ children }) {
  return <div className="text-color-0700 w-60 font-medium select-none ml-2 grow inline-flex items-center">{children}</div>;
}

export function PageActions({ children }) {
  return <div className="inline-flex items-center justify-end grow">{children}</div>;
}
