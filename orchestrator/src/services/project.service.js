const { Op } = require("sequelize");
const { getPagination, getPagingData } = require("../utils/pagination");
const TestStatus = require("../runner/enums/TestStatus");

module.exports = {
  list,
  create,
  get,
  update,
  delete: _delete
};

async function list(AccountId, page = 0, size = 10000) {
  const { limit, offset } = getPagination(page, size);
  const data = await global.DbStoreModel.ProjectMaster.findAndCountAll({
    attributes: ["id", "name", "description", "status", "createdAt", "updatedAt"],
    where: { AccountId },
    order: [["createdAt", "DESC"]],
    limit,
    offset
  });
  const projectIds = data?.rows?.map((s) => s.id);
  const builds = await getRunningBuilds(projectIds);
  for (let i = 0; i < data?.rows.length; i++) {
    const p = data.rows[i].toJSON();
    p.builds = builds[p.id] || 0;
    data.rows[i] = p;
  }
  return getPagingData(data, page, limit);
}

async function create(AccountId, payload) {
  if (await global.DbStoreModel.ProjectMaster.findOne({ where: { name: payload.name } })) {
    throw new Error(`Project by name '${payload.name}' is already registered`);
  }
  const prj = new global.DbStoreModel.ProjectMaster({
    ...payload,
    AccountId
  });
  prj.createdAt = Date.now();
  prj.updatedAt = Date.now();
  await prj.save();
  return prj;
}

async function update(accoutId, id, payload) {
  const prj = await get(accoutId, id);
  Object.assign(prj, payload);
  prj.updatedAt = Date.now();
  return await prj.save();
}

async function _delete(accoutId, id) {
  const prj = await get(accoutId, id);
  return await prj.destroy({ force: true });
}

// helper functions

async function get(AccountId, id) {
  let prj;
  if (AccountId) {
    prj = await global.DbStoreModel.ProjectMaster.findOne({
      include: global.DbStoreModel.Account,
      where: { id, AccountId }
    });
  } else {
    prj = await global.DbStoreModel.ProjectMaster.findByPk(id);
  }

  if (!prj) throw new Error(`Project ID:${id} not found`);
  return prj;
}

async function getRunningBuilds() {
  const list = await global.DbStoreModel.BuildMaster.findAll({
    attributes: ["buildNo"],
    include: global.DbStoreModel.ProjectMaster,
    where: {
      status: {
        [Op.in]: [TestStatus.DRAFT, TestStatus.RUNNING]
      }
    }
  });

  const res = {};
  list.forEach((build) => {
    const pid = build.ProjectMaster.id;
    if (res[pid] === undefined) res[pid] = 0;
    res[pid]++;
  });

  return res;
}
