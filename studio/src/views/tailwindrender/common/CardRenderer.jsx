export const Card = ({ children }) => <div className="flex flex-col w-full rounded border my-1">{children}</div>;

export const CardHeader = ({ children }) => {
  if (!children) return null;
  return (
    <div className="flex flex-row justify-between items-center border-b bg-slate-100 hover:bg-color-0050 text-left text-xs font-medium text-color-primary p-2 rounded-t">
      {children}
    </div>
  );
};
