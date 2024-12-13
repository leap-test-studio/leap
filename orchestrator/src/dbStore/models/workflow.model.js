const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
    const Workflow = sequelize.define(
        "Workflow",
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
            tableName: "automation_workflows"
        }
    );
    Workflow.associate = function (models) {
        Workflow.belongsTo(models.Account, { onDelete: "cascade" });
        Workflow.belongsTo(models.ProjectMaster, { onDelete: "cascade" });
    };
    return Workflow;
};
