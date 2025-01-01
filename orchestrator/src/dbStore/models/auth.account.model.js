module.exports = (sequelize, DataTypes) => {
    const Account = sequelize.define(
        "Account",
        {
            id: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            email: { type: DataTypes.STRING, allowNull: false, unique: true },
            passwordHash: { type: DataTypes.STRING, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            contact: { type: DataTypes.STRING },
            country: { type: DataTypes.STRING },
            acceptTerms: { type: DataTypes.BOOLEAN },
            role: { type: DataTypes.STRING, allowNull: false },
            verificationToken: { type: DataTypes.STRING },
            verified: { type: DataTypes.DATE },
            resetToken: { type: DataTypes.STRING },
            resetTokenExpires: { type: DataTypes.DATE },
            passwordReset: { type: DataTypes.DATE },
            managerId: { type: DataTypes.UUID },
            addedById: { type: DataTypes.UUID },
            created: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updated: { type: DataTypes.DATE },
            activationDt: { type: DataTypes.DATE },
            expiryDt: { type: DataTypes.DATE },
            isActivated: {
                type: DataTypes.VIRTUAL,
                get() {
                    return this.activationDt && Date.parse(this.activationDt) <= Date.now();
                }
            },
            isExpired: {
                type: DataTypes.VIRTUAL,
                get() {
                    return this.expiryDt && Date.parse(this.expiryDt) <= Date.now();
                }
            },
            isVerified: {
                type: DataTypes.VIRTUAL,
                get() {
                    return !!(this.verified || this.passwordReset);
                }
            }
        },
        {
            schema: global.config.DBstore.schemaName || "public",
            // disable default timestamp fields (createdAt and updatedAt)
            timestamps: false,
            tableName: "auth_accounts",
            defaultScope: {
                // exclude password hash by default
                attributes: { exclude: ["passwordHash"] }
            },
            scopes: {
                // include hash with this scope
                withHash: { attributes: {} }
            }
        }
    );
    Account.associate = function (models) {
        Account.hasMany(models.RefreshToken, { onDelete: "cascade" });
        Account.hasMany(models.ProjectMaster, { onDelete: "cascade" });
        Account.hasMany(models.BuildMaster, { onDelete: "cascade" });
        Account.hasMany(models.TestScenario, { onDelete: "cascade" });
        Account.hasMany(models.TestCase, { onDelete: "cascade" });
        Account.hasMany(models.ScheduleJob, { onDelete: "cascade" });
        Account.hasMany(models.Workflow);
        Account.belongsTo(models.Tenant, { onDelete: "SET NULL" });
    };
    return Account;
};
