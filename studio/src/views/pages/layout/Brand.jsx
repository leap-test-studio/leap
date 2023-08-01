import LogoRenderer from "./LogoRenderer";

function Brand({ showTitle, product }) {
  return (
    <div className="py-3 inline-flex items-center">
      <LogoRenderer className="m-1 h-6 w-6" name={product.name} />
      {showTitle && (
        <div className="cursor-pointer text-md tracking-normal font-normal flex flex-col items-center justify-center">
          <label className="px-2 lg:tracking-wider text-xl">{product.name}</label>
          <p className="px-2 tracking-tighter font-normal text-orange-500" style={{ fontSize: 10 }}>
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default Brand;
