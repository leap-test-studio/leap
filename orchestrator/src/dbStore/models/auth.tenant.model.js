module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define(
    "Tenant",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT }
    },
    {
      schema: global.config.DBstore.schemaName || "public",
      // disable default timestamp fields (createdAt and updatedAt)
      timestamps: true,
      tableName: "auth_tenants"
    }
  );

  Tenant.associate = function (models) {
    Tenant.hasMany(models.Account, { onDelete: "SET NULL" });
    Tenant.hasMany(models.ProjectMaster, { onDelete: "SET NULL" });
    Tenant.hasMany(models.TestScenario, { onDelete: "SET NULL" });
    Tenant.hasMany(models.TestCase, { onDelete: "SET NULL" });
  };
  return Tenant;
};
