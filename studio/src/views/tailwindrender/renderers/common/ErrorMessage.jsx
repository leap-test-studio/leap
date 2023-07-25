export default function ErrorMessage({ path, errors }) {
  return (
    <>
      {errors?.length > 0 && (
        <label htmlFor={path} className="block text-xs text-left font-medium text-red-600 w-full select-none">
          {errors}
        </label>
      )}
    </>
  );
}
