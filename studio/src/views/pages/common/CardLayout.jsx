function CardLayout({ className, children, ...rest }) {
  return (
    <div
      className={`bg-white hover:bg-color-0050 border border-slate-50 hover:border hover:border-color-0300 text-sm hover:shadow-lg rounded-lg cursor-pointer p-2 mt-2 ${className ? className : ""}`}
      {...rest}
    >
      {children}
    </div>
  );
}
export default CardLayout;
