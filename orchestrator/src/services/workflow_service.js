const { getPagination, getPagingData } = require("../utils");
const Engine = require("../engine");
const { E_RUN_TYPE, E_EXEC_STATE } = require("engine_utils");
module.exports = {
    list,
    get,
    create,
    update,
    delete: _delete,
    triggerSequence
};

async function list(ProjectMasterId, page = 0, size = 10000) {
    const { limit, offset } = getPagination(page, size);
    const data = await global.DbStoreModel.Workflow.findAndCountAll({
        where: { ProjectMasterId },
        order: [["createdAt", "DESC"]],
        limit,
        offset
    });
    return getPagingData(data, page, limit);
}

async function create(AccountId, payload) {
    if (await global.DbStoreModel.Workflow.findOne({ where: { name: payload.name, ProjectMasterId: payload.ProjectMasterId } })) {
        throw new Error(`Workflow by name '${payload.name}' is already registered`);
    }
    const wf = new global.DbStoreModel.Workflow(payload);
    wf.AccountId = AccountId;
    wf.createdAt = Date.now();
    wf.updatedAt = Date.now();
    await wf.save();
    return wf;
}

async function update(id, payload) {
    let wf = await get(id);
    Object.assign(wf, payload);
    wf.changed("updatedAt", true);
    wf.updatedAt = new Date();
    await wf.save();
    return wf.toJSON();
}

async function _delete(id) {
    const wf = await get(id);
    return await wf.destroy({ force: true });
}

async function triggerSequence(AccountId, id) {
    const wf = await get(id);

    let ProjectMasterId = wf.ProjectMasterId;
    let nextBuildNumber = await global.DbStoreModel.BuildMaster.max("buildNo", {
        where: {
            ProjectMasterId,
            type: E_RUN_TYPE.WORKFLOW
        }
    });

    if (nextBuildNumber == null) {
        nextBuildNumber = 0;
    }
    nextBuildNumber = Number(nextBuildNumber) + 1;
    const build = new global.DbStoreModel.BuildMaster({
        type: E_RUN_TYPE.WORKFLOW,
        buildNo: nextBuildNumber,
        total: wf.nodes?.length,
        status: E_EXEC_STATE.RUNNING,
        AccountId,
        ProjectMasterId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        startTime: Date.now(),
        flow: wf.toJSON()
    });

    await build.save();
    const flow = wf.toJSON();
    flow.bid = build.id;
    const instance = new Engine(flow);
    instance.start();
}

// helper functions
async function get(id) {
    const wf = await global.DbStoreModel.Workflow.findByPk(id);
    if (!wf) throw new Error(`Workflow ID:${id} not found`);
    return wf;
}
