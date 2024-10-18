import React, { useEffect, useState } from "react";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog, UploadFile } from "../../utilities";
import * as actionTypes from "../../../redux/actions";
import { useDispatch } from "react-redux";

const Model = {
  schema: {
    properties: {
      name: {
        type: "string",
        maxLength: 25,
        description: "Enter name"
      },
      description: {
        type: "string",
        description: "Enter description"
      }
    },
    required: ["name"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/name",
        label: "Name"
      },
      {
        type: "Control",
        scope: "#/properties/description",
        label: "Description",
        options: {
          multi: true
        }
      }
    ]
  }
};

function CreateProjectDialog({ showDialog, createProject, onClose }) {
  const dispatch = useDispatch();
  const [data, setData] = useState({ name: "", description: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, isUploading] = useState(false);

  useEffect(() => {
    resetState();
    return () => resetState();
  }, []);
  const resetState = () => {
    setProgress(0);
    isUploading(false);
    setSelectedFile(null);
    setData({ name: "", description: "" });
  };

  const handleSubmit = async () => {
    if (selectedFile == null) {
      createProject(data);
      resetState();
    } else {
      isUploading(true);
      const formdata = new FormData();
      formdata.append("name", data.name);
      formdata.append("description", data.description);
      formdata.append("upload-file", selectedFile);
      const response = await UploadFile("POST", "/api/v1/project/importer/json", formdata, (percent) => setProgress(Math.floor(percent)));
      console.log(response);
      if (response.status === 200) {
        onClose();
        resetState();
        dispatch({
          type: actionTypes.CREATE_PROJECT,
          payload: {
            showMessage: "success",
            ...response.body
          }
        });
      } else {
        dispatch({
          type: actionTypes.CREATE_PROJECT,
          payload: {
            showMessage: "error",
            ...response.body
          }
        });
      }
    }
  };

  const handleFileSelection = (e) => {
    if (e?.target?.files?.length > 0) {
      const file = e?.target?.files[0];
      if (file.type == "application/json" && file.name.startsWith("ProjectExport-") && file.size > 0 && file.name.endsWith(".json")) {
        setSelectedFile(e?.target?.files[0]);
      } else {
        setSelectedFile(null);
      }
    }
  };

  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        resetState();
        onClose();
      }}
      title="Create Project"
      saveTitle="Create"
      onSave={handleSubmit}
    >
      <div id="file-uploader" className="mt-2 w-full">
        <div className="mt-1">
          <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
        </div>
        {uploading ? (
          <div className="flex flex-col items-center justify-center w-full">
            <span className="mt-2 font-light text-color-0400">Progress: {progress}%</span>
            <div className="rounded h-2 w-full bg-gray-300">
              <div style={{ width: `${progress}%` }} className="h-full bg-green-600 rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="flex flex-row my-2 items-center h-10">
            <input
              type="file"
              onChange={handleFileSelection}
              multiple={false}
              accept=".json"
              className="w-full cursor-pointer bg-transparent outline-none transition file:mr-2 file:border-collapse file:rounded-r-none file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-white file:py-2 file:px-4 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary disabled:cursor-default disabled:bg-white"
            />
          </div>
        )}
      </div>
    </CustomDialog>
  );
}

export default CreateProjectDialog;
