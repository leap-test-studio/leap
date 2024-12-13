export enum E_STATIC_ID {
    START = "start",
    STOP = "stop"
}

export enum E_REDIS_KEY {
    JOB_WAITING_QUEUE = "JOB-WAITING-QUEUE",
    JOB_PROCESSING_QUEUE = "JOB-PROCESSING-QUEUE",
    JOB_PROCESSED_QUEUE = "JOB-PROCESSED-QUEUE"
}

export enum E_RUN_TYPE {
    PROJECT = 0,
    TESTCASE = 1,
    TESTSCENARIO = 2,
    WORKFLOW = 3
}

export enum E_STATUSCODES {
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    ERROR = "ERROR"
}

export enum E_EVENT_TYPE {
    START_EVENT = "START_EVENT",
    TIMER_EVENT = "TIMER_EVENT",
    TEST_CASE_EVENT = "TEST_CASE_EVENT",
    TEST_SUITE_EVENT = "TEST_SUITE_EVENT",
    STOP_EVENT = "STOP_EVENT"
}

export enum E_NODE_STATE {
    READY = "READY",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    ERRORED = "ERRORED",
    SKIPPED = "SKIPPED",
    ABORTED = "ABORTED",
    INACTIVE = "INACTIVE"
}

export enum E_EXEC_STATE {
    DRAFT = 0,
    RUNNING = 1,
    PASS = 2,
    FAIL = 3,
    UNKNOWN = 4,
    SKIP = 5,
    ABORT = 6,
    INVALID_TESTCASE = 999
}

export const TestStatus = Object.freeze({
    [E_EXEC_STATE.DRAFT]: "Draft",
    [E_EXEC_STATE.RUNNING]: "Running",
    [E_EXEC_STATE.PASS]: "Pass",
    [E_EXEC_STATE.FAIL]: "Fail",
    [E_EXEC_STATE.UNKNOWN]: "Unknown",
    [E_EXEC_STATE.SKIP]: "Skipped",
    [E_EXEC_STATE.ABORT]: "Aborted",
    [E_EXEC_STATE.INVALID_TESTCASE]: "Invalid Testcase"
});

export enum E_TEST_TYPE {
    Scenario = 0,
    API = 1,
    WEB = 2,
    SSH = 3
}

export const BuildTypes = Object.freeze({
    [E_RUN_TYPE.PROJECT]: "P",
    [E_RUN_TYPE.TESTSCENARIO]: "S",
    [E_RUN_TYPE.TESTCASE]: "C",
    [E_RUN_TYPE.WORKFLOW]: "F"
});

export const TestCaseTypes = Object.freeze({
    [E_TEST_TYPE.Scenario]: "Scenario",
    [E_TEST_TYPE.API]: "REST API",
    [E_TEST_TYPE.WEB]: "Web",
    [E_TEST_TYPE.SSH]: "SSH"
});

export const TestCaseTypesOneOf = Object.freeze(Object.entries(TestCaseTypes).map(([key, value]) => ({ const: key, title: value })));

export enum E_SCREENSHOT_TYPE {
    Never = 0,
    Inherit = 1,
    Success = 2,
    Failure = 3,
    Always = 4
}

export enum E_SLEEP_TIMING_TYPE {
    None = 0,
    Inherit = 1,
    Before = 2,
    After = 3,
    BeforeAndAfter = 4
}

export enum E_DIRECTION {
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical"
}
