const express = require("express");
const templateController = require("../controllers/templateController.js");
const auth = require("../middlewares/authMiddleware.js");
const { validate } = require("../middlewares/validation.js");
const router = express.Router();

router.get("/templates", auth([1, 3]), templateController.getAllTemplates);
router.get("/templates/:id", auth([1, 3]), templateController.getTemplateById);
router.post("/templates/create", auth([1, 3]), validate(["name", "slug", "jsonText", "visibility", "topic", "type"]), templateController.createTemplate);
router.put("/templates/:id", auth([1, 3]), validate(["name", "slug", "jsonText", "visibility", "topic", "type", "description", "price", "status"]), templateController.updateTemplate);
router.delete("/templates/:id", auth([1, 3]), templateController.deleteTemplate);

module.exports = router;