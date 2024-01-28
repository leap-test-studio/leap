import IconRenderer from "../../IconRenderer";
import { IconButton, Spinner } from "../../utilities";

export default function FirstTimeCard({ id, loading, title, details, icon, buttonTitle, buttonIcon, onClick, onClose }) {
  return (
    <>
      {loading ? (
        <Spinner>Loading</Spinner>
      ) : (
        <div className="bg-white h-fit shadow-lg w-96 rounded-md flex flex-col items-center p-5">
          <IconRenderer icon={icon} className="text-color-0500 animate-bounce mt-5" style={{ fontSize: 70 }} />
          <span id={`${id}-label`} className="my-4 text-center text-slate-800 uppercase text-xl select-none">
            {title}
          </span>
          {details && <label className="my-2 text-center text-slate-700 text-base select-none">{details}</label>}
          <div className="flex flex-row items-center justify-center select-none">
            <IconButton id={`${id}-btn`} title={buttonTitle} icon={buttonIcon} onClick={onClick} />
            {onClose && (
              <button
                className="text-xs items-center px-4 py-1 text-white rounded focus:outline-none shadow-sm hover:shadow-2xl bg-red-300 hover:bg-red-200 mx-1"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
