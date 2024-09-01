module.exports = (sequelize, DataTypes) => {
  const ScheduleJob = sequelize.define(
    "ScheduleJob",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      status: { type: DataTypes.INTEGER, defaultValue: 1 },
      cron_setting: { type: DataTypes.STRING, allowNull: false },
      callback: { type: DataTypes.JSON }
    },
    {
      schema: global.config.DBstore.schemaName || "public",
      paranoid: true,
      timestamps: true,
      tableName: "automation_schedule_job"
    }
  );
  ScheduleJob.associate = function (models) {
    ScheduleJob.belongsTo(models.ProjectMaster, { onDelete: "cascade" });
    ScheduleJob.belongsTo(models.Account, { onDelete: "cascade" });
    ScheduleJob.hasMany(models.ScheduleJobLog);
  };
  return ScheduleJob;
};
