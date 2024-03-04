import { CustomDialog } from "../../utilities";

export default function DeleteNodeDialog({ showDialog, deleteNode, selectedNode, onClose }) {
  return (
    <CustomDialog open={showDialog} onClose={onClose} title="Delete Node">
      <span className="mt-2">Are you sure you want to delete the selected Node?</span>
      <div className="flex flex-row text-lg text-cds-red-0700 font-bold justify-center mb-2">{selectedNode?.id}</div>
      <div className="flex items-start justify-between pb-2 border-t border-solid border-slate-300" />
      <div className="flex justify-end text-cds-white">
        <button
          type="button"
          className="flex items-center px-5 py-1 rounded focus:outline-none shadow-sm bg-cds-red-0800 hover:bg-cds-red-0700 uppercase"
          onClick={() => deleteNode()}
        >
          DELETE
        </button>
      </div>
    </CustomDialog>
  );
}
