const isEmpty = require("lodash/isEmpty");

exports.accountMap = async () => {
    const objectsArray = await global.DbStoreModel.Account.findAll({ attributes: ["id", "email"] });
    const accountMap = new Map();
    objectsArray.map((obj) => {
        accountMap.set(obj.id, obj.email);
    });
    return accountMap;
};
exports.getAccountName = async (items = [], columns) => {
    if (isEmpty(columns)) return items;

    const accountMap = await exports.accountMap();
    return items.map((acc) => {
        columns.forEach((col) => {
            acc[col] = accountMap.get(acc[col]) || acc[col];
        });
        return acc;
    });
};
