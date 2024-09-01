const { getPagination, getPagingData } = require("../utils");

module.exports = {
  list,
  get,
  create,
  update,
  delete: _delete
};

async function list(ProjectMasterId, page = 0, size = 10000) {
  const { limit, offset } = getPagination(page, size);
  const data = await global.DbStoreModel.TestPlan.findAndCountAll({
    where: { ProjectMasterId },
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });
  return getPagingData(data, page, limit);
}

async function create(AccountId, payload) {
  if (await global.DbStoreModel.TestPlan.findOne({ where: { name: payload.name, ProjectMasterId: payload.ProjectMasterId } })) {
    throw new Error(`TestPlan by name '${payload.name}' is already registered`);
  }
  const plan = new global.DbStoreModel.TestPlan(payload);
  plan.AccountId = AccountId;
  plan.createdAt = Date.now();
  plan.updatedAt = Date.now();
  await plan.save();
  return plan;
}

async function update(id, payload) {
  let prj = await get(id);
  Object.assign(prj, payload);
  prj.changed("updatedAt", true);
  prj.updatedAt = new Date();
  await prj.save();
  return prj.toJSON();
}

async function _delete(id) {
  const plan = await get(id);
  return await plan.destroy({ force: true });
}

// helper functions
async function get(id) {
  const plan = await global.DbStoreModel.TestPlan.findByPk(id);
  if (!plan) throw new Error(`TestPlan ID:${id} not found`);
  return plan;
}
