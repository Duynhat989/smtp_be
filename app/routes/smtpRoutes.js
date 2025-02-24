const express = require("express");
const smtpController = require("../controllers/smtpController");
const auth = require('../middlewares/authMiddleware.js');
const router = express.Router();

router.get("/smtps", auth([1, 3]), smtpController.smtps);
router.post("/smtps", auth([1, 3]), smtpController.createSmtp);
router.put("/smtps/:id", auth([1, 3]), smtpController.updateSmtp);
router.delete("/smtps/:id", auth([1, 3]), smtpController.deleteSmtp);

module.exports = router;
