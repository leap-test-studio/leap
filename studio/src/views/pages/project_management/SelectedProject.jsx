import { useNavigate } from "react-router-dom";

import { IconRenderer } from "../../utilities";

const ArrayIcon = () => (
  <svg
    aria-hidden="true"
    className="w-6 h-6 text-color-label cursor-pointer hover:bg-slate-200 rounded mr-2"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const SelectedCard = ({ label, onClose }) => (
  <div className="inline-flex items-center mx-2">
    <ArrayIcon />
    <div className="inline-flex items-center hover:shadow-md rounded-full bg-slate-100 border p-1 cursor-pointer">
      <div className="h-7 w-7 rounded-full text-center bg-color-0200 border items-center justify-center">
        <i className="fad fa-xs fa-solid fa-folder-tree text-color-0800" />
      </div>
      <span className="mx-2 inline-flex tracking-wide items-center text-color-label font-semibold select-all">{label}</span>
      <button onClick={onClose} className="focus:outline-none mx-2 font-extrabold text-red-600 cursor-pointer">
        <IconRenderer icon="Close" className="h-5 w-5" />
      </button>
    </div>
  </div>
);
function SelectedProject({ product, project, scenario, resetContext, changeTestScenario }) {
  const navigate = useNavigate();

  const resetProject = () => {
    resetContext();
    navigate(`${product.page.urlPrefix}${product.page.projectsListPage}`, { replace: true });
  };

  return (
    <div className="inline-flex w-[50rem] items-center">
      {project?.name && (
        <div className="inline-flex items-center text-color-label cursor-pointer hover:bg-slate-200 rounded py-0.5 px-2" onClick={resetProject}>
          <svg aria-hidden="true" className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <label>Home</label>
        </div>
      )}
      {project?.name && <SelectedCard label={project?.name} onClose={resetProject} />}
      {scenario?.name && <SelectedCard label={scenario?.name} onClose={() => changeTestScenario(null)} />}
    </div>
  );
}

export default SelectedProject;
