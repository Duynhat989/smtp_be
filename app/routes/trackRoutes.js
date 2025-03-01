const express = require("express");
const trackingController = require("../controllers/trackingController.js");
const auth = require('../middlewares/authMiddleware.js');
const router = express.Router();

router.get("/tracking/:id", trackingController.tracking);

module.exports = router;
