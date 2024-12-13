import { IconButton, Spinner, IconRenderer, CloseButton } from "@utilities/.";

export default function FirstTimeCard({ id, loading, title, details, icon, buttonTitle, buttonIcon, onClick, onClose }) {
  return (
    <>
      {loading ? (
        <Spinner>Loading</Spinner>
      ) : (
        <div className="bg-white h-fit shadow-lg w-96 rounded-md flex flex-col items-center p-5">
          <IconRenderer icon={icon} className="text-color-0600 animate-bounce mt-5" style={{ fontSize: 70 }} />
          <span id={`${id}-label`} className="my-4 text-center text-color-label uppercase text-xl select-none">
            {title}
          </span>
          {details && <label className="my-2 text-center text-color-label text-base select-none">{details}</label>}
          <div className="flex flex-row items-center justify-center select-none space-x-2">
            <IconButton id={`${id}-btn`} title={buttonTitle} icon={buttonIcon} onClick={onClick} />
            {onClose && <CloseButton onClose={onClose} />}
          </div>
        </div>
      )}
    </>
  );
}
