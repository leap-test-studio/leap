export default function CloseButton({ onClose }) {
  return (
    <button
      type="button"
      className="flex flex-row items-center justify-center px-5 py-1 rounded focus:outline-none shadow-sm bg-slate-200 hover:bg-slate-100 text-slate-700 text-xs"
      onClick={onClose}
    >
      Close
    </button>
  );
}
