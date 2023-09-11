const { Op } = require("sequelize");
const { getPagination, getPagingData } = require("../utils/pagination");
const TestStatus = require("../runner/enums/TestStatus");

module.exports = {
  list,
  create,
  get,
  getDetails,
  update,
  delete: _delete,
  export: _export,
  getBuilds
};

async function _export(id) {
  const prj = await global.DbStoreModel.ProjectMaster.findOne({
    include: {
      model: global.DbStoreModel.TestScenario,
      include: global.DbStoreModel.TestCase
    },
    where: { id }
  });
  return prj.toJSON();
}

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
    status: 1,
    AccountId
  });
  prj.createdAt = Date.now();
  prj.updatedAt = Date.now();
  await prj.save();
  return prj;
}

async function update(accoutId, id, payload) {
  let prj = await get(accoutId, id);
  Object.assign(prj, payload);
  prj.updatedAt = Date.now();
  await prj.save();
  return await getDetails(id);
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

async function getDetails(id) {
  let prj = await global.DbStoreModel.ProjectMaster.findOne({
    include: {
      model: global.DbStoreModel.TestScenario,
      include: global.DbStoreModel.TestCase
    },
    where: { id }
  });

  if (!prj) throw new Error(`Project ID:${id} not found`);
  prj = prj.toJSON();
  prj.TestScenarios = prj.TestScenarios.sort((a, b) => {
    if (a.createdAt < b.createdAt) return -1;
    if (a.createdAt > b.createdAt) return 1;
    return 0;
  });
  for (let index = 0; index < prj.TestScenarios.length; index++) {
    prj.TestScenarios[index].TestCases = prj.TestScenarios[index].TestCases.sort((a, b) => {
      if (a.seqNo < b.seqNo) return -1;
      if (a.seqNo > b.seqNo) return 1;
      return 0;
    });
  }
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

async function getBuilds(ProjectMasterId) {
  return await global.DbStoreModel.BuildMaster.findAll({
    attributes: ["id", "buildNo", "type", "status", "total", "passed", "failed", "skipped", "running", "flow", "startTime", "endTime"],
    where: {
      ProjectMasterId
    },
    order: [["buildNo", "DESC"]]
  });
}
