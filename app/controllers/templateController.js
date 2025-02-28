const { Templates } = require("../models");

// Tạo mới template
exports.createTemplate = async (req, res) => {
    try {
        const { name, slug, avatar, jsonText, visibility = 1, topic, type, description, price = 0 } = req.body;
        const userId = req.user.id
        const template = await Templates.create({
            userId,
            name,
            avatar,
            jsonText,
            visibility,
            topic,
            type,
            description,
            price
        });

        res.status(201).json({ success: true, data: template });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Lấy danh sách tất cả template với phân trang
exports.getAllTemplates = async (req, res) => {
    try {
        let { limit = 10, page = 0 } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);
        const templates = await Templates.findAll({
            limit: limit,
            offset: page * limit,
        });
        res.status(200).json({ success: true, data: templates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy một template theo ID
exports.getTemplateById = async (req, res) => {
    try {
        const template = await Templates.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }
        res.status(200).json({ success: true, data: template });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật template
exports.updateTemplate = async (req, res) => {
    try {
        const template = await Templates.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }
        await template.update(req.body);
        res.status(200).json({ success: true, data: template });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Xóa template
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await Templates.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }
        await template.destroy();
        res.status(200).json({ success: true, message: "Template deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
