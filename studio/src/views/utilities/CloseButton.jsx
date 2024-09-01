export const CloseButton = ({ onClose }) => (
  <button
    id="close-btn"
    type="button"
    className="text-center px-4 py-1 rounded focus:outline-none shadow hover:shadow-xl bg-slate-200 hover:bg-slate-100 text-color-label text-xs border mr-2"
    onClick={onClose}
  >
    Close
  </button>
);
