const { getPagination, getPagingData } = require("../utils");

module.exports = {
  list,
  create,
  update,
  delete: _delete
};

async function list(page = 0, size = 10000) {
  const { limit, offset } = getPagination(page, size);
  const data = await global.DbStoreModel.Tenant.findAndCountAll({
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });
  return getPagingData(data, page, limit);
}

async function create(payload) {
  if (await global.DbStoreModel.Tenant.findOne({ where: { name: payload.name } })) {
    throw new Error(`Tenant by name '${payload.name}' is already registered`);
  }
  const tenant = new global.DbStoreModel.Tenant(payload);
  tenant.createdAt = Date.now();
  tenant.updatedAt = Date.now();
  await tenant.save();
  return tenant;
}

async function update(id, payload) {
  let prj = await get(id);
  Object.assign(prj, payload);
  prj.changed("updatedAt", true);
  prj.updatedAt = new Date();
  await prj.save();
  return prj;
}

async function _delete(id) {
  const tenant = await get(id);
  return await tenant.destroy({ force: true });
}

// helper functions
async function get(id) {
  const tenant = await global.DbStoreModel.Tenant.findByPk(id);
  if (!tenant) throw new Error(`Tenant ID:${id} not found`);
  return tenant;
}
