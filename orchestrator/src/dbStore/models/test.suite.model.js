module.exports = (sequelize, DataTypes) => {
  const TestScenario = sequelize.define(
    "TestScenario",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: "comp" },
      description: { type: DataTypes.TEXT },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        get: function () {
          return Boolean(this.getDataValue("status"));
        },
        set: function (value) {
          return this.setDataValue("status", Number(value));
        }
      },
      remark: { type: DataTypes.TEXT },
      settings: { type: DataTypes.JSON },
      ProjectMasterId: { type: DataTypes.UUID, unique: "comp" }
    },
    {
      paranoid: false,
      timestamps: true,
      tableName: "automation_suites"
    }
  );
  TestScenario.associate = function (models) {
    TestScenario.hasMany(models.TestCase);
    TestScenario.belongsTo(models.Account, { onDelete: "cascade" });
    TestScenario.belongsTo(models.ProjectMaster, { onDelete: "cascade" });
  };
  return TestScenario;
};
