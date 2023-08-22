const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const TestCase = sequelize.define(
    "TestCase",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      seqNo: {
        type: DataTypes.INTEGER,
        unique: "comp",
        get: function () {
          return String(this.getDataValue("seqNo")).padStart(4, "0");
        },
        set: function (value) {
          return this.setDataValue("seqNo", parseInt(value));
        }
      },
      enabled: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        get: function () {
          return Boolean(this.getDataValue("enabled"));
        },
        set: function (value) {
          return this.setDataValue("enabled", Number(value));
        }
      },
      type: { type: DataTypes.INTEGER, defaultValue: 0 },
      given: { type: DataTypes.TEXT("medium") },
      when: { type: DataTypes.TEXT("medium") },
      then: { type: DataTypes.TEXT("medium") },
      execSteps: { type: DataTypes.JSON },
      settings: { type: DataTypes.JSON },
      tags: { type: DataTypes.JSON },
      AccountId: { type: DataTypes.UUID, unique: "comp" },
      TestSuiteId: { type: DataTypes.UUID, unique: "comp" }
    },
    {
      paranoid: true,
      timestamps: true,
      tableName: "automation_cases"
    }
  );
  TestCase.associate = function (models) {
    TestCase.hasMany(models.Job);
    TestCase.belongsTo(models.Account, { onDelete: "cascade" });
    TestCase.belongsTo(models.TestSuite, { onDelete: "cascade" });
  };
  return TestCase;
};
