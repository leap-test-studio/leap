export const Card = ({ children }) => <div className="flex flex-col w-full rounded border border-slate-300 my-px">{children}</div>;

export const CardHeader = ({ children }) => {
  if (!children) return null;
  return <div className="bg-color-0100 text-left text-xs font-medium text-color-primary px-2 py-1 rounded-t">{children}</div>;
};
