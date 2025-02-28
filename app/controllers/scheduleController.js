const { Sequelize } = require('sequelize')
const { STATUS, loadApiKey, Schedules, Emails } = require("../models");

// Lấy danh sách tất cả học sinh
exports.create = async (req, res) => {
    // Lấy khóa api
    try {
        const { name, timezone, telegramBot, startDate, endDate, emailLst, templateHTML,business,subject } = req.body
        const userId = req.user.id
        let result = await Schedules.create({
            name,
            timezone,
            telegramBot,
            startDate,
            endDate,
            html:templateHTML,
            ownerId: userId,
            business,
            subject
        })
        // Bổ sung thêm email cho dự án sau 
        // Trạng thái xử lý 
        // xử lý xog mới cho hoàn thành
        const proccessEmail = async (emails) => {
            for (let index = 0; index < emails.length; index++) {
                const dataEmail = emails[index];
                // Thêm email vào model
                Emails.create({
                    scheId: result.id,
                    email: dataEmail.email,
                    config:dataEmail
                })
            }
        }
        proccessEmail(emailLst)
        res.status(200).json({
            success: true,
            data: result,
            msg: "create/sucess"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error
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
        ...ifSql
    }
    if(status != 0){
        ifSql = {
            ...ifSql,
            status: status
        }
    }
    console.log(ifSql)
    let result = await Schedules.findAll({
        where: ifSql,
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
        subQuery: false, // ✅ Tránh subquery sai
        include: [
            {
                model: Emails,
                as: "emails",
                attributes: [
                    [Sequelize.fn("COUNT", Sequelize.col("emails.id")), "emailCount"], // Tổng số email
                    [Sequelize.fn("COUNT", Sequelize.literal(`CASE WHEN emails.status = 2 THEN 1 END`)), "send"] // Số email đã gửi
                ],
                required: false // 🟡 Tránh mất Schedules không có email nào
            }
        ],
        group: ["Schedules.id"] // ✅ Nhóm theo ID
    });
    
    
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
exports.destroyed = async (req, res) => {
    const { id } = req.params; // Lấy id từ URL
    const userId = req.user.id;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Schedule ID is required"
        });
    }

    try {
        // Xóa lịch trình theo ID và userId
        const result = await Schedules.destroy({
            where: { id, ownerId: userId }
        });

        if (result === 0) {
            return res.status(404).json({
                success: false,
                error: "Schedule not found or you don't have permission to delete it"
            });
        }

        res.status(200).json({
            success: true,
            message: "Schedule deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete schedule'
        });
    }
};
