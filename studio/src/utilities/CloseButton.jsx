export const CloseButton = ({ onClose }) => (
  <button
    id="close-btn"
    type="button"
    className="text-center font-semibold px-3 py-1.5 rounded focus:outline-none shadow hover:shadow-xl bg-slate-50 text-color-label text-xs border border-slate-300"
    onClick={onClose}
  >
    Close
  </button>
);
