const express = require("express");
const scheduleController = require("../controllers/scheduleController.js");
const auth = require('../middlewares/authMiddleware.js');
const { validate } = require('../middlewares/validation.js');
const router = express.Router();


router.get("/schedules", auth([1, 3]), scheduleController.list);
router.post("/schedule/create", auth([1, 3]), validate(['name', 'startDate', 'endDate',"templateHTML"]), scheduleController.create);
// router.put("/smtps/:id", auth([1, 3]), scheduleController.updateSmtp);
router.delete("/schedule/:id", auth([1, 3]), scheduleController.destroyed);

module.exports = router;
