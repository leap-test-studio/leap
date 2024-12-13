const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
    const RefreshToken = sequelize.define(
        "RefreshToken",
        {
            token: { type: DataTypes.STRING, unique: true },
            expires: { type: DataTypes.DATE },
            created: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            createdByIp: { type: DataTypes.STRING },
            revoked: { type: DataTypes.DATE },
            revokedByIp: { type: DataTypes.STRING },
            replacedByToken: { type: DataTypes.STRING },
            isExpired: {
                type: DataTypes.VIRTUAL,
                get() {
                    return this.expires < moment(Date.now()).utc().milliseconds();
                }
            },
            isActive: {
                type: DataTypes.VIRTUAL,
                get() {
                    return !this.revoked && !this.isExpired;
                }
            }
        },
        {
            schema: global.config.DBstore.schemaName || "public",
            // disable default timestamp fields (createdAt and updatedAt)
            timestamps: false,
            tableName: "auth_tokens"
        }
    );

    RefreshToken.associate = function (models) {
        RefreshToken.belongsTo(models.Account);
    };
    return RefreshToken;
};
