const fs = require("fs");
const { Op } = require("sequelize");
const { E_EXEC_STATE } = require("engine_utils");

const { getPagination, getPagingData, getAccountName } = require("../utils");

module.exports = {
    list,
    create,
    get,
    getDetails,
    update,
    delete: _delete,
    export: _export,
    import: _import,
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

async function _import(TenantId, AccountId, payload, file) {
    try {
        const rawdata = fs.readFileSync(file.path);
        const prjPayload = JSON.parse(rawdata);
        delete prjPayload.id;
        delete prjPayload.isActivated;
        if (payload?.name) prjPayload.name = payload?.name;
        if (payload?.description) prjPayload.description = payload?.description;

        return await global.DbStoreModel.sequelize.transaction(async (transaction) => {
            const now = new Date();

            const newProject = await global.DbStoreModel.ProjectMaster.create(
                {
                    ...prjPayload,
                    status: 1,
                    TenantId,
                    AccountId,
                    updatedBy: AccountId,
                    createdAt: now,
                    updatedAt: now
                },
                {
                    transaction
                }
            );

            prjPayload.TestScenarios?.forEach(async (ts) => {
                const suiteData = {
                    ...ts,
                    TenantId,
                    AccountId,
                    ProjectMasterId: newProject.id,
                    createdAt: now,
                    updatedAt: now
                };
                delete suiteData.id;
                const suite = new global.DbStoreModel.TestScenario(suiteData);
                await suite.save();

                ts.TestCases?.forEach(async (tc) => {
                    const caseData = {
                        ...tc,
                        TenantId,
                        AccountId,
                        TestScenarioId: suite.id,
                        createdAt: now,
                        updatedAt: now
                    };
                    delete caseData.id;
                    const tcase = new global.DbStoreModel.TestCase(caseData);
                    await tcase.save();
                });
            });

            return newProject;
        });
    } catch (e) {
        logger.error(e);
        return Promise.reject(e);
    }
}

async function list(TenantId, page = 0, size = 10000) {
    const { limit, offset } = getPagination(page, size);
    const data = await global.DbStoreModel.ProjectMaster.findAndCountAll({
        attributes: ["id", "name", "description", "status", "createdAt", "updatedAt", "updatedBy", "AccountId", "settings"],
        where: { TenantId },
        order: [["updatedAt", "DESC"]],
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
    const response = getPagingData(JSON.parse(JSON.stringify(data)), page, limit);
    await getAccountName(response.items, ["updatedBy", "AccountId"]);
    return response;
}

async function create(TenantId, AccountId, { name, description, settings, TestScenarios }) {
    if (await global.DbStoreModel.ProjectMaster.findOne({ where: { name } })) {
        throw new Error(`Project by name '${name}' is already registered`);
    }
    return await global.DbStoreModel.sequelize.transaction(async (transaction) => {
        const now = new Date();

        const newProject = await global.DbStoreModel.ProjectMaster.create(
            {
                name,
                description,
                settings,
                status: 1,
                TenantId,
                AccountId,
                createdAt: now,
                updatedAt: now
            },
            {
                transaction
            }
        );

        TestScenarios?.forEach(async (ts) => {
            const suiteData = {
                ...ts,
                TenantId,
                AccountId,
                ProjectMasterId: newProject.id,
                createdAt: now,
                updatedAt: now
            };
            delete suiteData.id;
            const suite = new global.DbStoreModel.TestScenario(suiteData);
            await suite.save();

            ts.TestCases?.forEach(async (tc) => {
                const caseData = {
                    ...tc,
                    TenantId,
                    AccountId,
                    TestScenarioId: suite.id,
                    createdAt: now,
                    updatedAt: now
                };
                delete caseData.id;
                const tcase = new global.DbStoreModel.TestCase(caseData);
                await tcase.save();
            });
        });

        return newProject;
    });
}

async function update(tenantId, updatedBy, id, payload) {
    let prj = await get(tenantId, id);
    Object.assign(prj, payload);
    prj.changed("updatedAt", true);
    prj.updatedAt = new Date();
    prj.updatedBy = updatedBy;
    await prj.save();
    return await getDetails(id);
}

async function _delete(tenantId, id) {
    const prj = await get(tenantId, id);
    return await prj.destroy({ force: true });
}

// helper functions

async function get(TenantId, id) {
    let prj;
    if (TenantId) {
        prj = await global.DbStoreModel.ProjectMaster.findOne({
            include: global.DbStoreModel.Account,
            where: { id, TenantId }
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
                [Op.in]: [E_EXEC_STATE.DRAFT, E_EXEC_STATE.RUNNING]
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
        attributes: ["id", "buildNo", "label", "type", "status", "total", "passed", "failed", "skipped", "running", "flow", "startTime", "endTime"],
        where: {
            ProjectMasterId
        },
        order: [["buildNo", "DESC"]]
    });
}
