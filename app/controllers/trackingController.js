const { Emails } = require("../models"); // Giả sử model Smtps được định nghĩa trong thư mục models


exports.tracking = async (req, res) => {
    const { id } = req.params; // Lấy id từ url là tracking
    const { m_id } = req.query; // Lấy id từ url là tracking
    const clientIp = req.ip || "NoIP"; 
    const userAgent = req.headers["user-agent"];
    const referer = req.headers["referer"] || "Direct Access";
    const openedAt = new Date();

    try {
        console.log("tracking:", id);
        console.log("m_id:", m_id);
        console.log("IP:", clientIp);
        console.log("User-Agent:", userAgent);
        console.log("Referer:", referer);
        console.log("Opened At:", openedAt);

        await Emails.update(
            { status: 3, openedAt, clientIp, userAgent, referer },
            { where: { id: m_id } }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Tracking Error:", error);
        res.status(200).json({ success: false });
    }
}