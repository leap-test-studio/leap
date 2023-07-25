module.exports = (sequelize, DataTypes) => {
  const TestSuite = sequelize.define(
    "TestSuite",
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
  TestSuite.associate = function (models) {
    TestSuite.hasMany(models.TestCase);
    TestSuite.hasMany(models.BuildMaster);
    TestSuite.belongsTo(models.Account, { onDelete: "cascade" });
    TestSuite.belongsTo(models.ProjectMaster, { onDelete: "cascade" });
  };
  return TestSuite;
};
