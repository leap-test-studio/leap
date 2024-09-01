module.exports = (sequelize, DataTypes) => {
  const ScheduleJobLog = sequelize.define(
    "ScheduleJobLog",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      machine: { type: DataTypes.STRING, allowNull: false },
      start_time: { type: DataTypes.DATE, allowNull: false },
      end_time: { type: DataTypes.DATE, allowNull: true, default: null },
      result: { type: DataTypes.JSON }
    },
    {
      schema: global.config.DBstore.schemaName || "public",
      paranoid: false,
      timestamps: false,
      tableName: "automation_schedule_job_log"
    }
  );
  ScheduleJobLog.associate = function (models) {
    ScheduleJobLog.belongsTo(models.ScheduleJob, { onDelete: "cascade" });
  };
  return ScheduleJobLog;
};
