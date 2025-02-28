const { sequelize } = require("../config/config");

const { ROLES, User } = require('../models/userModel');
const { STATUS, Setup } = require('../models/setupModel');
const { Smtps } = require("../models/smtpModel");
const { Templates,
  VISIBILITY,
  TEMPLATE_TYPE, } = require("./templateModel");
const { Tools } = require("./toolModel");
const { Schedules } = require("./scheduleModel");
const { Emails } = require("./emailModel");
const { LoginHistory } = require("./loginHistoryModel");




sequelize.sync({ force: false }).then(() => {
  console.log('Database đã được đồng bộ!');
});
Schedules.hasMany(Emails, { foreignKey: "scheId", as: "emails" });
Emails.belongsTo(Schedules, { foreignKey: "scheId", as: "schedule" });
module.exports = {
  User,
  ROLES,
  STATUS,
  Setup,
  Smtps,
  Templates,
  VISIBILITY,
  TEMPLATE_TYPE,
  Tools,
  Schedules,
  LoginHistory,
  Emails
};