export default function Footer({ product }) {
  const { copyrightYear, organization } = product;
  return (
    <footer className="sticky bottom-0 bg-slate-500 text-white select-none w-full">
      <div className="px-5 py-px flex flex-row justify-end items-center">
        <div className="text-right" style={{ fontSize: "8px" }}>
          &copy; Copyright {copyrightYear} {organization.name} | All rights reserved
        </div>
      </div>
    </footer>
  );
}
