function CardLayout({ className, children, ...rest }) {
  return (
    <div
      className={`bg-white hover:bg-color-0050 border text-sm hover:shadow-md rounded-lg cursor-pointer px-4 py-2.5 ${className ? className : ""}`}
      {...rest}
    >
      {children}
    </div>
  );
}
export default CardLayout;
