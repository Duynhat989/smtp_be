const { Smtps } = require("../models"); // Giả sử model Smtps được định nghĩa trong thư mục models

exports.smtps = async (req, res) => {
    try {
        const userId = req.user.id
        // Kiểm tra nếu userId không tồn tại
        if (!userId) return res.status(400).json({ success: false, message: "Missing userId in request." });

        // Tìm tất cả các bản ghi thuộc userId
        const smtps = await Smtps.findAll({
            where: {
                userId,
            },
        });
        return res.status(200).json({ success: true, message: "Retrieve SMTP list successfully.", data: smtps });
    } catch (error) {
        return res.status(500).json({ success: false, message: "An error has occurred. Please try again later." });
    }
};
// Hàm thêm mới
exports.createSmtp = async (req, res) => {
    try {
        const { email, config, password } = req.body;
        const userId = req.user.id

        // Kiểm tra đầu vào
        if (!email || !config || !password || !userId) {
            return res.status(400).json({ message: "Tất cả các trường đều bắt buộc." });
        }

        // Tạo bản ghi mới
        const newSmtp = await Smtps.create({
            email,
            config,
            password,
            userId,
        });

        return res.status(201).json({ message: "Tạo SMTP thành công.", data: newSmtp });
    } catch (error) {
        console.error("Lỗi khi tạo SMTP:", error);
        return res.status(500).json({ message: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
    }
};

// Hàm cập nhật
exports.updateSmtp = async (req, res) => {
    try {
        const { id } = req.params; // Lấy id từ URL
        const { email, config, password } = req.body;

        const userId = req.user.id
        // Tìm SMTP theo id
        const smtp = await Smtps.findOne({
            where:{
                id,
                userId
            }
        });

        if (!smtp) {
            return res.status(404).json({ message: "Không tìm thấy SMTP với id đã cho." });
        }

        // Cập nhật dữ liệu
        await smtp.update({
            email: email || smtp.email,
            config: config || smtp.config,
            password: password || smtp.password,
            userId: userId || smtp.userId,
        });

        return res.status(200).json({ message: "Cập nhật SMTP thành công.", data: smtp });
    } catch (error) {
        console.error("Lỗi khi cập nhật SMTP:", error);
        return res.status(500).json({ message: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
    }
};

// Hàm xóa
exports.deleteSmtp = async (req, res) => {
    try {
        const { id } = req.params; // Lấy id từ URL
        const userId = req.user.id
        // Tìm SMTP theo id
        const smtp = await Smtps.findOne({
            where:{
                id,
                userId
            }
        });
        if (!smtp) {
            return res.status(404).json({ message: "Không tìm thấy SMTP với id đã cho." });
        }

        // Xóa bản ghi
        await smtp.destroy();

        return res.status(200).json({ message: "Xóa SMTP thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa SMTP:", error);
        return res.status(500).json({ message: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
    }
};
