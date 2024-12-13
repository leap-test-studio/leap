const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

exports.getLocalTime = () => {
    return dayjs.tz(new Date().getTime(), "Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss");
};
