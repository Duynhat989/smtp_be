const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");

const STATUS = {
  PENDING: 1, // Chưa thực hiện
  RUNNING: 2, // Đang chạy
  COMPLETED: 3, // Hoàn thành
  CANCELED: 4, // Đã hủy
};

const Schedules = sequelize.define("Schedules", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100], // Tên chiến dịch phải có độ dài từ 3 đến 100 ký tự
    },
  },
  description: {
    type: DataTypes.TEXT, // Mô tả chi tiết chiến dịch
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE, // Ngày bắt đầu chiến dịch
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  endDate: {
    type: DataTypes.DATE, // Ngày kết thúc chiến dịch
    allowNull: false,
    validate: {
      isDate: true,
    },
  },
  status: {
    type: DataTypes.INTEGER, // Trạng thái chiến dịch
    allowNull: false,
    defaultValue: STATUS.PENDING, // Mặc định là chờ thực hiện
    validate: {
      isIn: [[STATUS.PENDING, STATUS.RUNNING, STATUS.COMPLETED, STATUS.CANCELED]],
    },
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users", // Tên bảng Users
      key: "id", // Khóa chính của bảng Users
    },
    onDelete: "CASCADE", // Xóa bản ghi khi user bị xóa
    onUpdate: "CASCADE", // Cập nhật khi ownerId thay đổi
  },
});

module.exports = {
  Schedules,
  STATUS,
};
