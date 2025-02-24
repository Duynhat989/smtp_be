const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");
const ROLES = {
  ADMIN: 1,
  DEV: 2,
  CUSTOMER: 3,
};
const STATUS = {
  ON: 1,
  OFF: 2
};
const Smtps = sequelize.define("Smtps", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Tên bảng Users
      key: "id", // Khóa chính của bảng Users
    },
    onDelete: "CASCADE", // Xóa bản ghi khi user bị xóa
    onUpdate: "CASCADE", // Cập nhật khi userId thay đổi
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true, // Đảm bảo email có định dạng hợp lệ
    },
  },
  password: {
    type: DataTypes.STRING, // Tham số mật khẩu
    allowNull: false,
    validate: {
      len: [8, 100], // Đảm bảo mật khẩu có độ dài từ 8 đến 100 ký tự
    },
  },
  config: {
    type: DataTypes.JSON, // Lưu cấu hình dưới dạng JSON
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: STATUS.ON, // Mặc định là Sinh viên (3)
    validate: {
      isIn: [[STATUS.ON, STATUS.OFF]], // Chỉ cho phép 1 (Admin), 2 (Dev), hoặc 3 (Customer)
    },
  },
});

module.exports = {
  Smtps
};