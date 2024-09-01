const { Op } = require("sequelize");

const { getPagination, getPagingData, getAccountName } = require("../utils");
const ProjectService = require("./project.service");
const { isEmpty } = require("lodash");

module.exports = {
  list,
  create,
  clone,
  get,
  update,
  delete: _delete
};

async function list(TenantId, ProjectMasterId, page = 0, size = 10000) {
  const { limit, offset } = getPagination(page, size);
  const request = {
    attributes: ["id", "name", "description", "status", "createdAt", "updatedAt", "updatedBy", "AccountId", "remark"],
    where: {
      TenantId,
      ProjectMasterId
    },
    order: [["createdAt", "ASC"]],
    limit,
    offset
  };
  const data = await global.DbStoreModel.TestScenario.findAndCountAll(request);
  const response = getPagingData(JSON.parse(JSON.stringify(data)), page, limit);
  await getAccountName(response.items, ["updatedBy", "AccountId"]);
  return response;
}

async function create(TenantId, AccountId, ProjectMasterId, payload) {
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
    TenantId,
    AccountId,
    ProjectMasterId
  });
  ts.createdAt = Date.now();
  ts.updatedAt = Date.now();
  await ts.save();
  return ts;
}

async function clone(TenantId, AccountId, ProjectMasterId, suiteId, payload) {
  const now = Date.now();
  const testcases = await global.DbStoreModel.TestCase.findAll({
    include: {
      model: global.DbStoreModel.TestScenario,
      where: { id: suiteId }
    }
  });
  if (!testcases || testcases.length === 0) {
    throw new Error("Cloning from Invalid Suite");
  }

  const testScenarios = await global.DbStoreModel.TestScenario.findAll({
    attributes: ["id"],
    where: {
      ProjectMasterId,
      TenantId
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

  const testSuite = testcases[0].TestScenario.toJSON();
  const suite = await global.DbStoreModel.sequelize.transaction(async (t) => {
    const tsData = {
      ...testSuite,
      ...payload,
      TenantId,
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
        TenantId,
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
  return suite;
}

async function update(tenantId, accountId, projectId, id, payload) {
  const ts = await get(tenantId, projectId, id);
  if (!isEmpty(payload)) {
    Object.assign(ts, payload);
  }
  ts.changed("updatedAt", true);
  ts.updatedBy = accountId;
  ts.updatedAt = Date.now();
  await ts.save();
  ProjectService.update(tenantId, accountId, projectId, {});
  return `Suite[${ts.name}] changes saved successfully.`;
}

async function _delete(tenantId, projectId, id) {
  const ts = await get(tenantId, projectId, id);
  return await ts.destroy({ force: true });
}

// helper functions

async function get(TenantId, ProjectMasterId, id) {
  let ts;
  if (TenantId) {
    ts = await global.DbStoreModel.TestScenario.findOne({
      include: [global.DbStoreModel.Account, global.DbStoreModel.ProjectMaster],
      where: {
        id,
        TenantId,
        ProjectMasterId
      }
    });
  } else {
    ts = await global.DbStoreModel.TestScenario.findByPk(id);
  }

  if (!ts) throw new Error("Test Suite Not Found");
  return ts;
}
