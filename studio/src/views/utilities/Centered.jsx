export const Centered = ({ children, ...rest }) => (
  <div className="h-full flex flex-col grow items-center justify-center select-none" {...rest}>
    {children}
  </div>
);
