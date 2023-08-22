import React from "react";
import CustomDialog from "../../utilities/CustomDialog";
import { useState } from "react";
import { upload } from "../../utilities/http";
import * as actionTypes from "../../../redux/actions";
import { useDispatch } from "react-redux";

function ImportTestCaseDialog({ showDialog, projectId, testSuiteId, testcase, onClose }) {
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, isUploading] = useState(false);

  const reset = () => {
    setProgress(0);
    setSelectedFile(null);
    isUploading(false);
  };
  return (
    <CustomDialog
      open={showDialog}
      onClose={onClose}
      title={`Import Test Case - TCID-${testcase?.seqNo}`}
      saveTitle="Import"
      className="max-w-lg"
      onSave={async () => {
        isUploading(true);
        const formData = new FormData();
        formData.append("upload-file", selectedFile);
        const response = await upload("POST", `/api/v1/project/${projectId}/suite/${testSuiteId}/testcase/${testcase?.id}/import`, formData, (percent) => setProgress(Math.floor(percent)));
        if (response.status == 200) {
          reset();
          onClose();

          dispatch({
            type: actionTypes.UPDATE_TESTCASE,
            payload: {
              showMessage: true,
              message: "Test Case imported successfully",
              loading: false
            }
          });
        }
      }}
    >
      <div className="flex flex-col my-2 items-center w-full">
        <input type="file" accept="*.json" multiple={false} onChange={e => {
          const file = e.target.files[0];
          if (file?.type == "application/json" && file?.size > 0 && file?.name.endsWith(".json")) {
            setSelectedFile(file);
          } else {
            setSelectedFile(null);
          }
        }} />
        {uploading && <div className="flex flex-col my-2 items-center w-full">
          <span className="mt-2 font-light text-color-0400">Progress: {progress}%</span>
          <div className="rounded h-2 w-full bg-gray-300">
            <div style={{ width: `${progress}%` }} className="h-full bg-green-500 rounded animate-pulse" />
          </div>
        </div>}
      </div>
    </CustomDialog>
  );
}

export default ImportTestCaseDialog;
