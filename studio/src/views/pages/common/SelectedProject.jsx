import IconRenderer from "../../IconRenderer";
import { useNavigate } from "react-router-dom";

function SelectedProject({ product, project, suite, resetContext, changeSuite }) {
  const navigate = useNavigate();

  const resetProject = () => {
    resetContext();
    navigate(`/${product?.page.base}/${product?.page.landingPage}`, { replace: true });
  };

  return (
    <div className="p-1 inline-flex w-[50rem] items-center">
      {project?.name && (
        <svg
          onClick={resetProject}
          aria-hidden="true"
          className="w-4 h-4 mr-2 text-slate-100"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
        </svg>
      )}
      {project?.name && (
        <label className="mr-2 text-slate-100" onClick={resetProject}>
          Home
        </label>
      )}
      {project?.name && (
        <div className="inline-flex items-center mx-1">
          <svg aria-hidden="true" className="w-6 h-6 text-slate-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
          <div className="inline-flex items-center shadow-lg rounded-full bg-slate-100">
            <div className="h-7 w-7 rounded-full text-center bg-blue-100 items-center justify-center">
              <i className="fad fa-xs fa-solid fa-folder-tree text-indigo-700" />
            </div>
            <span className="mx-2 inline-flex tracking-wide items-center text-color-1000 font-semibold select-all">{project?.name}</span>
            <button onClick={resetProject} className="focus:outline-none mx-2 font-extrabold text-red-600">
              <IconRenderer icon="Close" className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      {suite?.name && (
        <div className="inline-flex items-center mx-1">
          <svg aria-hidden="true" className="w-6 h-6 text-slate-100" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            ></path>
          </svg>
          <div className="inline-flex items-center shadow-lg rounded-full bg-slate-100">
            <div className="h-7 w-7 rounded-full text-center bg-blue-100 items-center justify-center">
              <i className="fad fa-xs fa-solid fa-folder-open text-indigo-700" />
            </div>
            <span className="mx-2 inline-flex tracking-wide items-center text-color-1000 font-semibold select-all">{suite?.name}</span>
            <button onClick={() => changeSuite(null)} className="focus:outline-none mx-2 font-extrabold text-red-600">
              <IconRenderer icon="Close" className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelectedProject;
