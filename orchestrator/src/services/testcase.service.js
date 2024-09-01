const { Op } = require("sequelize");
const ProjectService = require("./project.service");
const { getPagination, getPagingData, TestCaseTypes, getAccountName } = require("../utils");
const fs = require("fs");
const { isEmpty } = require("lodash");

module.exports = {
  list,
  create,
  clone,
  get,
  update,
  delete: _delete,
  import: _import,
  swap
};

async function _import(tenantId, accountId, projectId, suiteId, testcaseId, file) {
  try {
    const rawdata = fs.readFileSync(file);
    const tc = JSON.parse(rawdata);
    return await update(tenantId, accountId, projectId, suiteId, testcaseId, {
      execSteps: tc.execSteps,
      type: TestCaseTypes.findIndex((t) => t == tc.type),
      settings: tc.settings,
      tags: tc.tags
    });
  } catch (e) {
    logger.error(e);
    return Promise.reject(e);
  }
}

async function list(TenantId, TestScenarioId, page = 0, size = 10000) {
  const { limit, offset } = getPagination(page, size);
  const data = await global.DbStoreModel.TestCase.findAndCountAll({
    where: {
      TenantId,
      TestScenarioId
    },
    order: [["seqNo", "ASC"]],
    limit,
    offset
  });
  const response = getPagingData(JSON.parse(JSON.stringify(data)), page, limit);
  await getAccountName(response.items, ["updatedBy", "AccountId"]);
  return response;
}

async function create(TenantId, AccountId, TestScenarioId, payload) {
  const ts = await global.DbStoreModel.TestScenario.findByPk(TestScenarioId);

  const testScenarios = await global.DbStoreModel.TestScenario.findAll({
    attributes: ["id"],
    where: {
      ProjectMasterId: ts.ProjectMasterId,
      TenantId
    }
  });

  let nextSeqNo = await global.DbStoreModel.TestCase.max("seqNo", {
    where: {
      TestScenarioId: {
        [Op.in]: testScenarios.map((scenario) => scenario.id)
      },
      TenantId
    }
  });
  if (nextSeqNo == null) {
    nextSeqNo = 0;
  }
  nextSeqNo = Number(nextSeqNo) + 1;

  const tc = global.DbStoreModel.TestCase.build({
    ...payload,
    enabled: 1,
    TenantId,
    AccountId,
    TestScenarioId,
    seqNo: nextSeqNo,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  await tc.save();
  return tc;
}

async function clone(TenantId, AccountId, TestScenarioId, id) {
  const ts = await global.DbStoreModel.TestScenario.findByPk(TestScenarioId);

  const testScenarios = await global.DbStoreModel.TestScenario.findAll({
    attributes: ["id"],
    where: {
      ProjectMasterId: ts.ProjectMasterId,
      TenantId
    }
  });

  let tc = await get(TenantId, TestScenarioId, id);
  tc = tc.toJSON();
  delete tc.id;
  delete tc.seqNo;
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
  nextSeqNo = Number(nextSeqNo) + 1;

  const tcClone = global.DbStoreModel.TestCase.build({
    ...tc,
    TenantId,
    AccountId,
    TestScenarioId,
    seqNo: nextSeqNo,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  await tcClone.save();
  return tcClone;
}

async function swap(tenantId, accountId, projectId, suiteId, source, target) {
  const sourceTc = await get(tenantId, suiteId, source);
  const sourceSeqNo = sourceTc.seqNo;
  sourceTc.seqNo = 99999;
  await sourceTc.save();

  const targetTc = await get(tenantId, suiteId, target);
  const targetSeqNo = targetTc.seqNo;
  targetTc.seqNo = sourceSeqNo;
  targetTc.changed("updatedAt", true);
  targetTc.updatedAt = Date.now();
  await targetTc.save();

  sourceTc.seqNo = targetSeqNo;
  sourceTc.changed("updatedAt", true);
  sourceTc.updatedAt = Date.now();
  await sourceTc.save();
  ProjectService.update(tenantId, accountId, projectId, {});
  return sourceTc;
}

async function update(tenantId, accountId, projectId, suiteId, id, payload) {
  const tc = await get(tenantId, suiteId, id);
  if (!isEmpty(payload)) {
    Object.assign(tc, payload);
  }
  tc.changed("updatedAt", true);
  tc.updatedBy = accountId;
  tc.updatedAt = Date.now();
  await tc.save();
  ProjectService.update(tenantId, accountId, projectId, {});
  return tc;
}

async function _delete(tenantId, suiteId, id) {
  const tc = await get(tenantId, suiteId, id);
  await tc.destroy({ force: true });
  return tc;
}

// helper functions

async function get(TenantId, TestScenarioId, id) {
  let tc;
  if (TenantId) {
    tc = await global.DbStoreModel.TestCase.findOne({
      include: global.DbStoreModel.TestScenario,
      where: {
        id,
        TenantId,
        TestScenarioId
      }
    });
  } else {
    tc = await global.DbStoreModel.TestCase.findByPk(id);
  }

  if (!tc) throw new Error("Test Case Not Found");
  return tc;
}
