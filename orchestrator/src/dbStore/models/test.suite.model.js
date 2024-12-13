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
            remark: { type: DataTypes.JSON },
            settings: { type: DataTypes.JSON },
            updatedBy: {
                type: DataTypes.UUID
            },
            ProjectMasterId: { type: DataTypes.UUID, unique: "comp" },
            AccountId: { type: DataTypes.UUID },
            TenantId: { type: DataTypes.UUID }
        },
        {
            schema: global.config.DBstore.schemaName || "public",
            paranoid: false,
            timestamps: true,
            tableName: "automation_suites"
        }
    );
    TestScenario.associate = function (models) {
        TestScenario.hasMany(models.TestCase);
        TestScenario.belongsTo(models.Account, { onDelete: "cascade" });
        TestScenario.belongsTo(models.ProjectMaster, { onDelete: "cascade" });
        TestScenario.belongsTo(models.Tenant, { onDelete: "SET NULL" });
    };
    return TestScenario;
};
