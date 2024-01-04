const { getPagination, getPagingData } = require("../utils/pagination");
const { Op } = require("sequelize");
const fs = require("fs");
const Types = ["Definition", "REST API", "Web", "SSH"];

module.exports = {
  list,
  create,
  clone,
  get,
  update,
  delete: _delete,
  import: _import
};

async function _import(accountId, scenarioId, testcaseId, file) {
  try {
    const rawdata = fs.readFileSync(file);
    const tc = JSON.parse(rawdata);
    delete tc.seqNo;
    tc.type = Types.findIndex((t) => t == tc.type);
    return await update(accountId, scenarioId, testcaseId, tc);
  } catch (e) {
    logger.error(e);
    return Promise.reject(e);
  }
}

async function list(AccountId, TestScenarioId, page = 0, size = 10000) {
  const { limit, offset } = getPagination(page, size);
  const data = await global.DbStoreModel.TestCase.findAndCountAll({
    where: {
      AccountId,
      TestScenarioId
    },
    order: [["seqNo", "ASC"]],
    limit,
    offset
  });
  return getPagingData(data, page, limit);
}

async function create(AccountId, TestScenarioId, payload) {
  const ts = await global.DbStoreModel.TestScenario.findByPk(TestScenarioId);

  const testScenarios = await global.DbStoreModel.TestScenario.findAll({
    attributes: ["id"],
    where: {
      ProjectMasterId: ts.ProjectMasterId
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
  nextSeqNo = Number(nextSeqNo) + 1;

  const tc = global.DbStoreModel.TestCase.build({
    ...payload,
    enabled: true,
    AccountId,
    TestScenarioId,
    seqNo: nextSeqNo,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  await tc.save();
  return tc;
}

async function clone(AccountId, TestScenarioId, id) {
  const ts = await global.DbStoreModel.TestScenario.findByPk(TestScenarioId);

  const testScenarios = await global.DbStoreModel.TestScenario.findAll({
    attributes: ["id"],
    where: {
      ProjectMasterId: ts.ProjectMasterId
    }
  });

  let tc = await get(AccountId, TestScenarioId, id);
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
    AccountId,
    TestScenarioId,
    seqNo: nextSeqNo,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  await tcClone.save();
  return tcClone;
}

async function update(accountId, scenarioId, id, payload) {
  const tc = await get(accountId, scenarioId, id);
  Object.assign(tc, payload);
  tc.updatedAt = Date.now();
  await tc.save();
  return `Testcase[${tc.label}] changes saved successfully.`;
}

async function _delete(accountId, scenarioId, id) {
  const tc = await get(accountId, scenarioId, id);
  return await tc.destroy({ force: true });
}

// helper functions

async function get(AccountId, TestScenarioId, id) {
  let tc;
  if (AccountId) {
    tc = await global.DbStoreModel.TestCase.findOne({
      include: global.DbStoreModel.TestScenario,
      where: {
        id,
        AccountId,
        TestScenarioId
      }
    });
  } else {
    tc = await global.DbStoreModel.TestCase.findByPk(id);
  }

  if (!tc) throw new Error("Test case not found");
  return tc;
}
