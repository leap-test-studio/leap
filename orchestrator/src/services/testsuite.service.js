const { now } = require("lodash");
const { getPagination, getPagingData } = require("../utils/pagination");

module.exports = {
  list,
  create,
  clone,
  get,
  update,
  delete: _delete
};

async function list(AccountId, ProjectMasterId, page = 0, size = 10000) {
  const { limit, offset } = getPagination(page, size);
  const data = await global.DbStoreModel.TestSuite.findAndCountAll({
    attributes: ["id", "name", "description", "status", "createdAt", "updatedAt"],
    where: {
      AccountId,
      ProjectMasterId
    },
    order: [["createdAt", "ASC"]],
    limit,
    offset
  });
  return getPagingData(data, page, limit);
}

async function create(AccountId, ProjectMasterId, payload) {
  if (await global.DbStoreModel.TestSuite.findOne({ where: { name: payload.name } })) {
    throw new Error(`TestSuite by name '${payload.name}' is already registered`);
  }
  const ts = new global.DbStoreModel.TestSuite({
    ...payload,
    AccountId,
    ProjectMasterId
  });
  ts.createdAt = Date.now();
  ts.updatedAt = Date.now();
  await ts.save();
  return ts;
}

async function clone(AccountId, ProjectMasterId, suiteId, payload) {
  const now = Date.now();
  const testcases = await global.DbStoreModel.TestCase.findAll({
    include: {
      model: global.DbStoreModel.TestSuite,
      where: { id: suiteId }
    }
  });
  if (!testcases || testcases.length === 0) {
    throw new Error("Cloning from Invalid TestSuite");
  }

  const testSuite = testcases[0].TestSuite.toJSON();
  await global.DbStoreModel.sequelize.transaction(async (t) => {
    const tsData = {
      ...testSuite,
      ...payload,
      AccountId,
      ProjectMasterId,
      createdAt: now,
      updatedAt: now
    };
    delete tsData.id;

    const ts = await global.DbStoreModel.TestSuite.create(tsData, { transaction: t });
    const suite = ts.toJSON();

    const request = [];
    testcases.forEach((tc) => {
      const testcase = {
        ...tc.toJSON(),
        AccountId,
        TestSuiteId: suite.id,
        createdAt: now,
        updatedAt: now
      };
      delete testcase.id;
      delete testcase.seqNo;
      request.push(global.DbStoreModel.TestCase.create(testcase, { transaction: t }));
    });
    return Promise.all(request);
  });
  return testcases;
}

async function update(accountId, projectId, id, payload) {
  const ts = await get(accountId, projectId, id);
  Object.assign(ts, payload);
  ts.updatedAt = Date.now();
  return await ts.save();
}

async function _delete(accountId, projectId, id) {
  const ts = await get(accountId, projectId, id);
  return await ts.destroy({ force: true });
}

// helper functions

async function get(AccountId, ProjectMasterId, id) {
  let ts;
  if (AccountId) {
    ts = await global.DbStoreModel.TestSuite.findOne({
      include: [global.DbStoreModel.Account, global.DbStoreModel.ProjectMaster],
      where: {
        id,
        AccountId,
        ProjectMasterId
      }
    });
  } else {
    ts = await global.DbStoreModel.TestSuite.findByPk(id);
  }

  if (!ts) throw new Error("Test suite not found");
  return ts;
}
