module.exports = (sequelize, DataTypes) => {
  const ProjectMaster = sequelize.define(
    "ProjectMaster",
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
      settings: { type: DataTypes.JSON },
      isActivated: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.status === 1;
        }
      },
      AccountId: { type: DataTypes.UUID, unique: "comp" }
    },
    {
      paranoid: true,
      timestamps: true,
      tableName: "automation_projects"
    }
  );
  ProjectMaster.associate = function (models) {
    ProjectMaster.hasMany(models.TestScenario);
    ProjectMaster.hasMany(models.BuildMaster);
    ProjectMaster.belongsTo(models.Account, { onDelete: "cascade" });
  };
  return ProjectMaster;
};
