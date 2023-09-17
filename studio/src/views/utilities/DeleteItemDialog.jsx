import CustomDialog from "./CustomDialog";

export default function DeleteItemDialog({ showDialog, title, question, item, onDelete, onClose }) {
  return (
    <CustomDialog open={showDialog} onClose={onClose} title={title}>
      <span className="mt-2 text-center">{question}</span>
      <div className="flex flex-row text-lg text-cds-red-0700 font-bold justify-center mt-2 mb-4">{item}</div>
      <div className="flex items-start justify-between pb-2 border-t border-solid border-slate-200" />
      <div className="flex justify-end text-cds-white w-full">
        <button
          id="delete-cancel"
          type="button"
          className="px-5 py-1 rounded focus:outline-none shadow-sm bg-slate-200 hover:bg-slate-100 uppercase text-slate-700"
          onClick={onClose}
        >
          CLOSE
        </button>
        <button
          id="delete-confirm"
          type="button"
          className="ml-2 px-5 py-1 rounded focus:outline-none shadow-sm bg-cds-red-0800 hover:bg-cds-red-0700 uppercase"
          onClick={onDelete}
        >
          DELETE
        </button>
      </div>
    </CustomDialog>
  );
}
