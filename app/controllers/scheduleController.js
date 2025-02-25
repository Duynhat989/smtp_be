const { STATUS, loadApiKey, Schedules, Emails } = require("../models");

// Lấy danh sách tất cả học sinh
exports.create = async (req, res) => {
    // Lấy khóa api
    try {
        const { name, description, startDate, endDate, emailList, html } = req.body
        const userId = req.user.id
        let result = await Schedules.create({
            name,
            description,
            startDate, endDate,
            ownerId: userId
        })
        // Bổ sung thêm email cho dự án sau 
        // Trạng thái xử lý 
        // xử lý xog mới cho hoàn thành
        const proccessEmail = async () => {
            for (let index = 0; index < emailList.length; index++) {
                const dataEmail = emailList[index];
                // Thêm email vào model
                // cấu trúc mô phòng cho email
                // let dataMail = {
                //     email: "vietduy989kc@gmail.com",
                //     keywords: [{
                //         name: "{{name}}",
                //         value: "Dinh Viet Duy"
                //     }, {
                //         name: "{{id_order}}",
                //         value: "235645526346436"
                //     }]
                // }
                let newInbox = async (email, keywords) => {
                    let htmlBase = html
                    // Thay đổi nội dung theo keyword
                    // Gắn thêm id theo dõi nội dung
                    // Thêm trình random class tránh quét nội dung
                    




                }
                Emails.create({
                    scheId: result.id,
                    email: dataEmail.email,
                    html: await newInbox(dataEmail.email, dataEmail.keywords)
                })
            }
        }
        proccessEmail()
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
    try {

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
