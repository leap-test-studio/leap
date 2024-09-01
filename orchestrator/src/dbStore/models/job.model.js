module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define(
    "Job",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      BuildMasterId: { type: DataTypes.UUID, unique: "comp" },
      TestCaseId: { type: DataTypes.UUID, unique: "comp" },
      actual: { type: DataTypes.JSON },
      result: { type: DataTypes.INTEGER, defaultValue: 0 },
      screenshot: { type: DataTypes.JSON },
      steps: { type: DataTypes.JSON },
      extras: { type: DataTypes.JSON },
      startTime: { type: DataTypes.DATE },
      endTime: { type: DataTypes.DATE }
    },
    {
      schema: global.config.DBstore.schemaName || "public",
      paranoid: false,
      timestamps: true,
      tableName: "automation_jobs"
    }
  );
  Job.associate = function (models) {
    Job.belongsTo(models.BuildMaster, { onDelete: "cascade" });
    Job.belongsTo(models.TestCase, { onDelete: "cascade" });
  };
  return Job;
};
