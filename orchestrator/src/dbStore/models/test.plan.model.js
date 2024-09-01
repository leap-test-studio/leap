const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const TestPlan = sequelize.define(
    "TestPlan",
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
        defaultValue: 0
      },
      type: { type: DataTypes.INTEGER, defaultValue: 0 },
      cron: { type: DataTypes.STRING },
      nodes: { type: DataTypes.JSON },
      edges: { type: DataTypes.JSON },
      AccountId: { type: DataTypes.UUID },
      ProjectMasterId: { type: DataTypes.UUID, unique: "comp" },
      updatedBy: { type: DataTypes.UUID }
    },
    {
      schema: global.config.DBstore.schemaName || "public",
      paranoid: true,
      timestamps: true,
      tableName: "automation_plans"
    }
  );
  TestPlan.associate = function (models) {
    TestPlan.belongsTo(models.Account, { onDelete: "cascade" });
    TestPlan.belongsTo(models.ProjectMaster, { onDelete: "cascade" });
  };
  return TestPlan;
};
