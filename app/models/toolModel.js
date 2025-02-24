const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");

const STATUS = {
  ACTIVE: 1, // Công cụ đang hoạt động
  INACTIVE: 2, // Công cụ không hoạt động
};

const Tools = sequelize.define("Tools", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100], // Tên công cụ có độ dài từ 3 đến 100 ký tự
    },
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Slug phải là duy nhất
    validate: {
      is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i, // Định dạng slug (chỉ chữ cái, số và dấu gạch ngang)
    },
  },
  description: {
    type: DataTypes.TEXT, // Mô tả công cụ
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING, // URL hình ảnh của công cụ
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER, // Trạng thái của công cụ
    allowNull: false,
    defaultValue: STATUS.ACTIVE, // Mặc định là hoạt động
    validate: {
      isIn: [[STATUS.ACTIVE, STATUS.INACTIVE]], // Chỉ cho phép giá trị 1 (ACTIVE) hoặc 2 (INACTIVE)
    },
  },
});

module.exports = {
  Tools,
  STATUS,
};