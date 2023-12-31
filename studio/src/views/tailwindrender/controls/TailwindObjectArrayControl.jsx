import { useCallback, useState } from "react";
import { rankWith, isObjectArrayControl } from "@jsonforms/core";
import TailwindTableControl from "../renderers/Table/TailwindTableControl";
import DeleteItemDialog from "../../utilities/DeleteItemDialog";
import { withJsonFormsArrayProps } from "../common/JsonFormsArrayProps";

export const TailwindObjectArrayControlRenderer = (props) => {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState(undefined);
  const [rowData, setRowData] = useState(undefined);
  const { ctx } = props;
  const openDeleteDialog = useCallback(
    (p, rowIndex) => {
      setOpen(true);
      setPath(p);
      setRowData(rowIndex);
    },
    [setOpen, setPath, setRowData]
  );
  const deleteCancel = useCallback(() => setOpen(false), [setOpen]);
  const deleteConfirm = useCallback(() => {
    const p = path.substring(0, path.lastIndexOf("."));
    props.removeItems(p, [rowData])();
    setOpen(false);
  }, [setOpen, path, rowData, props]);

  return (
    <>
      {props.visible && (
        <div className="overflow-y-scroll custom-scrollbar">
          <TailwindTableControl {...props} openDeleteDialog={openDeleteDialog} readonly={ctx?.readonly} />
          <DeleteItemDialog
            title="Delete Entry"
            question="Are you sure you want to delete the selected entry?"
            showDialog={open}
            onClose={deleteCancel}
            onDelete={deleteConfirm}
          />
        </div>
      )}
    </>
  );
};

export const tailwindObjectArrayControlTester = rankWith(1003, isObjectArrayControl);

export const TailwindObjectArrayControl = withJsonFormsArrayProps(TailwindObjectArrayControlRenderer);
