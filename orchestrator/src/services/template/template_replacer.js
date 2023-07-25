const TemplateReplacer = (template, context) => {
  let code = JSON.stringify(template);
  Object.entries(context).map(([key, value]) => {
    code = code.replaceAll("${" + key + "}", value);
  });
  return JSON.parse(code);
};

export default TemplateReplacer;
