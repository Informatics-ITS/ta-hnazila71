import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("activity_logs", {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      module: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Add foreign key for user_id referencing users table
    await queryInterface.addConstraint("activity_logs", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_activity_logs_user_id",
      references: {
        table: "users", // Assuming your users table is named 'users'
        field: "id", // Assuming 'id' is the primary key of the users table
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add foreign key for email referencing users table
    await queryInterface.addConstraint("activity_logs", {
      fields: ["email"],
      type: "foreign key",
      name: "fk_activity_logs_email",
      references: {
        table: "users", // Assuming your users table is named 'users'
        field: "email", // Assuming 'email' is unique in users table
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeConstraint("activity_logs", "fk_activity_logs_email");
    await queryInterface.removeConstraint("activity_logs", "fk_activity_logs_user_id");
    await queryInterface.dropTable("activity_logs");
  },
};