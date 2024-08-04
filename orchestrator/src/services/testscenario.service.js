const { Op } = require("sequelize");

const { getPagination, getPagingData } = require("../utils");
const ProjectService = require("./project.service");

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
  const request = {
    attributes: ["id", "name", "description", "status", "createdAt", "updatedAt"],
    where: {
      AccountId,
      ProjectMasterId
    },
    order: [["createdAt", "ASC"]],
    limit,
    offset
  };
  const data = await global.DbStoreModel.TestScenario.findAndCountAll(request);
  return getPagingData(data, page, limit);
}

async function create(AccountId, ProjectMasterId, payload) {
  if (
    await global.DbStoreModel.TestScenario.findOne({
      where: { name: payload.name }
    })
  ) {
    throw new Error(`Test Suite by name '${payload.name}' is already registered`);
  }
  const ts = new global.DbStoreModel.TestScenario({
    ...payload,
    status: 1,
    AccountId,
    ProjectMasterId
  });
  ts.createdAt = Date.now();
  ts.updatedAt = Date.now();
  await ts.save();
  return ts;
}

async function clone(AccountId, ProjectMasterId, scenarioId, payload) {
  const now = Date.now();
  const testcases = await global.DbStoreModel.TestCase.findAll({
    include: {
      model: global.DbStoreModel.TestScenario,
      where: { id: scenarioId }
    }
  });
  if (!testcases || testcases.length === 0) {
    throw new Error("Cloning from Invalid Suite");
  }

  const testScenarios = await global.DbStoreModel.TestScenario.findAll({
    attributes: ["id"],
    where: {
      ProjectMasterId
    }
  });

  let nextSeqNo = await global.DbStoreModel.TestCase.max("seqNo", {
    where: {
      TestScenarioId: {
        [Op.in]: testScenarios.map((scenario) => scenario.id)
      }
    }
  });
  if (nextSeqNo == null) {
    nextSeqNo = 0;
  }

  const testScenario = testcases[0].TestScenario.toJSON();
  const scenario = await global.DbStoreModel.sequelize.transaction(async (t) => {
    const tsData = {
      ...testScenario,
      ...payload,
      AccountId,
      ProjectMasterId,
      createdAt: now,
      updatedAt: now
    };
    delete tsData.id;

    const ts = await global.DbStoreModel.TestScenario.create(tsData, {
      transaction: t
    });
    const scenario = ts.toJSON();

    const request = [];
    testcases.forEach((tc) => {
      nextSeqNo = Number(nextSeqNo) + 1;

      const testcase = {
        ...tc.toJSON(),
        AccountId,
        TestScenarioId: scenario.id,
        createdAt: now,
        updatedAt: now
      };
      delete testcase.id;
      delete testcase.seqNo;
      testcase.seqNo = nextSeqNo;
      request.push(global.DbStoreModel.TestCase.create(testcase, { transaction: t }));
    });
    await Promise.all(request);
    return Promise.resolve(ts);
  });
  return scenario;
}

async function update(accountId, projectId, id, payload) {
  const ts = await get(accountId, projectId, id);
  Object.assign(ts, payload);
  ts.changed("updatedAt", true);
  ts.updatedAt = Date.now();
  await ts.save();
  ProjectService.update(accountId, projectId, {});
  return `Scenario[${ts.name}] changes saved successfully.`;
}

async function _delete(accountId, projectId, id) {
  const ts = await get(accountId, projectId, id);
  return await ts.destroy({ force: true });
}

// helper functions

async function get(AccountId, ProjectMasterId, id) {
  let ts;
  if (AccountId) {
    ts = await global.DbStoreModel.TestScenario.findOne({
      include: [global.DbStoreModel.Account, global.DbStoreModel.ProjectMaster],
      where: {
        id,
        AccountId,
        ProjectMasterId
      }
    });
  } else {
    ts = await global.DbStoreModel.TestScenario.findByPk(id);
  }

  if (!ts) throw new Error("Test scenario not found");
  return ts;
}
