module.exports = (sequelize, DataTypes) => {
  const BuildMaster = sequelize.define(
    "BuildMaster",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      buildNo: { type: DataTypes.INTEGER, unique: "comp" },
      type: { type: DataTypes.INTEGER, unique: "comp", defaultValue: 0 },
      status: { type: DataTypes.INTEGER, defaultValue: 0 },
      total: { type: DataTypes.INTEGER, defaultValue: 0 },
      passed: { type: DataTypes.INTEGER, defaultValue: 0 },
      failed: { type: DataTypes.INTEGER, defaultValue: 0 },
      skipped: { type: DataTypes.INTEGER, defaultValue: 0 },
      running: { type: DataTypes.INTEGER, defaultValue: 0 },
      TestSuiteId: { type: DataTypes.UUID, unique: "comp" },
      options: { type: DataTypes.JSON },
      startTime: { type: DataTypes.DATE },
      endTime: { type: DataTypes.DATE }
    },
    {
      paranoid: true,
      timestamps: true,
      tableName: "automation_builds",
      engine: "InnoDB"
    }
  );
  BuildMaster.associate = function (models) {
    BuildMaster.hasMany(models.Job);
    BuildMaster.belongsTo(models.Account, { onDelete: "cascade" });
    BuildMaster.belongsTo(models.TestSuite, { onDelete: "cascade" });
  };
  return BuildMaster;
};
