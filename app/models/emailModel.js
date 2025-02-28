const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");

const STATUS = {
  ERROR: 0, // Gửi lỗi hoặc hủy gửi
  PENDING: 1, // Chưa gửi
  SENT: 2, // Đã gửi
  SEEN: 3, // Đã xem
  CLICKED: 4, // Đã click
};

const Emails = sequelize.define("Emails", {
  scheId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Schedules", // Liên kết với bảng Schedules
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  config: {
    type: DataTypes.JSON, // Cấu hình SMTP hoặc gửi email
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: STATUS.PENDING, // Mặc định là chưa gửi
    validate: {
      isIn: [[STATUS.ERROR, STATUS.PENDING, STATUS.SENT, STATUS.SEEN, STATUS.CLICKED]],
    },
  },
  note: {
    type: DataTypes.TEXT, // Ghi chú về email
    allowNull: true,
    defaultValue: "", // Mặc định rỗng
  },
});

module.exports = {
  Emails,
  STATUS,
};
