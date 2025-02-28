const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");

const VISIBILITY = {
  PRIVATE: 1, // Chỉ cá nhân
  PUBLIC: 2, // Công khai
};

const TEMPLATE_TYPE = {
  PERSONAL: 1, // Của cá nhân
  ADMIN_PROVIDED: 2, // Do admin cung cấp
};

const Templates = sequelize.define("Templates", {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100], // Đảm bảo tên có độ dài từ 3 đến 100 ký tự
    },
  },
  avatar: {
    type: DataTypes.STRING, // Lưu URL của hình đại diện
    allowNull: true,
  },
  jsonText: {
    type: DataTypes.JSON, // Lưu cấu trúc giao diện dưới dạng JSON
    allowNull: false,
  },
  visibility: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: VISIBILITY.PRIVATE, // Mặc định là cá nhân
    validate: {
      isIn: [[VISIBILITY.PRIVATE, VISIBILITY.PUBLIC]],
    },
  },
  topic: {
    type: DataTypes.STRING, // Chủ đề của template
    allowNull: false,
    validate: {
      len: [3, 50],
    },
  },
  type: {
    type: DataTypes.INTEGER, // Loại template: cá nhân hay admin cung cấp
    allowNull: false,
    defaultValue: TEMPLATE_TYPE.PERSONAL,
    validate: {
      isIn: [[TEMPLATE_TYPE.PERSONAL, TEMPLATE_TYPE.ADMIN_PROVIDED]],
    },
  },
  description: {
    type: DataTypes.TEXT, // Mô tả ngắn gọn về template
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), // Giá của template
    allowNull: false,
    defaultValue: 0.00, // Mặc định là miễn phí
    validate: {
      min: 0, // Giá không được nhỏ hơn 0
    },
  },
  status: {
    type: DataTypes.BOOLEAN, // Trạng thái template (kích hoạt hoặc vô hiệu hóa)
    allowNull: false,
    defaultValue: true, // Mặc định là kích hoạt
  },
});

module.exports = {
  Templates,
  VISIBILITY,
  TEMPLATE_TYPE,
};