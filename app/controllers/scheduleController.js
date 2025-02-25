const { STATUS, loadApiKey, Schedules } = require("../models");

// Lấy danh sách tất cả học sinh
exports.create = async (req, res) => {
    // Lấy khóa api
    try {
        const { name, description, startDate, endDate } = req.body
        const userId = req.user.id
        let result = await Schedules.create({
            name,
            description,
            startDate, endDate,
            ownerId: userId
        })
        res.status(200).json({
            success: true,
            data: result
        }); // Gửi ID tệp về client
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to upload file'
        });
    }
};
// Lấy danh sách tất cả học sinh GET
exports.list = async (req, res) => {
    // Lấy khóa api
    const { limit = 10, page = 1, status = 0 } = req.query
    const offset = limit * (page - 1)
    const userId = req.user.id
    let ifSql = { ownerId: userId }
    ifSql = {
        ...ifSql,
        status: status == 0 ? null : status
    }
    let result = await Schedules.findAll({
        where: ifSql,
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit
    })
    res.status(200).json({
        success: true,
        data: result
    }); // Gửi ID tệp về client
    try {

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to upload file'
        });
    }
};