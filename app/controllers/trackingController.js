const { Emails } = require("../models"); // Giả sử model Smtps được định nghĩa trong thư mục models


exports.tracking = async (req, res) => {
    const { id } = req.params; // Lấy id từ url là tracking
    const { m_id } = req.query; // Lấy id từ url là tracking
    try {
        console.log("tracking:", id)
        console.log("m_id:", JSON.stringify(m_id))
        
        Emails.update(
            { status: 3 },
            { where: { id: m_id } }
        );
        res.status(200).json({
            success: true
        });
    } catch (error) {
        res.status(200).json({
            success: false
        });
    }
}