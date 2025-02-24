const { ROLES, User, LoginHistory } = require("../models");
const { encryption, compare } = require('../utils/encode');
const { createNewToken } = require('../middlewares/manageToken');
const { Sequelize, Op } = require('sequelize');

const EmailSender = require('../modules/smtp.module')
// Đăng kí tạo tài khoản
exports.register = async (req, res) => {
    const { name, email, phone, password } = req.body;
    const role = 3;
    try {
        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({
            status: 0,
            message: "Email exits",
            data: null
        });
        // Mã hóa mật khẩu
        const hashedPassword = await encryption(password);
        // Tạo người dùng mới
        user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role
        });
        // sendEmailWelcome(email, name)
        res.status(201).json({
            status: 1,
            message: "Register success",
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: "Error services",
            data: null
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({
            where:
            {
                [Op.or]: [
                    { email: email.trim() },
                    { phone: email.trim() }
                ]
            }
        });
        if (!user) return res.status(400).json({
            success: false,
            message: "Login failed",
            data: null
        });

        const isMatch = await compare(password, user.password);
        if (!isMatch) return res.status(400).json({
            success: false,
            message: "Login failed",
            data: null
        });

        const payload = { id: user.id, role: user.role };
        const token = createNewToken(payload);

        // Cập nhật lịch sử đăng nhập
        await LoginHistory.create({
            userId: user.id,
            ipAddress: req.ip === '::1' ? '127.0.0.1' : req.ip,
            userAgent: req.headers["user-agent"],
            status: "SUCCESS",
        });
        // Xử lý lịch sử đăng nhập
        return res.json({
            success: true,
            message: "Login success",
            data: {
                id: user.id,
                name: user.name,
                token: token,
                balance: parseInt(user.balance),
                role: user.role
            }
        });
    } catch (err) {
        // Ghi lại lịch sử đăng nhập với trạng thái thất bại
        if (email) {
            await LoginHistory.create({
                userId: null,
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"],
                status: "FAILURE",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error services",
            data: null
        });
    }
};

exports.verifyToken = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await User.findByPk(userId)
        if(user){
            return res.status(200).json({
                success: true
            });
        }else{
            return res.status(500).json({
                success: false
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error services",
            data: null
        });
    }
};
// admin và giáo viên Tạo tài khoản sinh viên
exports.createUser = async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    try {
        let user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({
            status: 0,
            message: req.t('errors.emailUsed'),
            data: null
        });

        if ((req.user.role === ROLES.TEACHER || req.user.role === ROLES.ADMIN) && ![ROLES.TEACHER, ROLES.STUDENT].includes(role)) {
            return res.status(403).json({
                status: 0,
                message: req.t('errors.forbidden'),
                data: null
            });
        }

        const hashedPassword = await encryption(password);
        user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role
        });
        res.status(201).json({
            status: 1,
            message: req.t('success.created'),
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return res.status(500).json({
            status: 0,
            message: req.t('errors.serverError'),
            data: null
        });
    }
};

// tìm kiếm xem có tài khoản đó không và gửi email

exports.forget = async (req, res) => {
    // ----
    try {
        const { email } = req.body
        const user = await User.findOne({
            where:
            {
                email: {
                    [Op.like]: `%${email}%`
                }
            }
        });
        if (!user) return res.status(404).json({
            success: false,
            message: "Not found account"
        });
        let randomNumber = Math.floor(10000000 + Math.random() * 90000000);
        await user.update({ verify: randomNumber });
        // Tiếp tục
        // sendEmailForget(user.email, user.name, randomNumber)
        return res.status(200).json({
            success: true,
            data: {
                name: user.name,
                email: user.email
            },
            message: "recovery success"
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: "error message"
        });
    }
}
exports.confirm = async (req, res) => {
    // ----
    try {
        const { code, email, new_password } = req.body
        const user = await User.findOne({
            where:
            {
                email: email,
                verify: code
            }
        });
        if (!user) return res.status(404).json({
            success: false,
            message: "wrong code"
        });
        const hashedPassword = await encryption(new_password);
        await user.update({ password: hashedPassword, verify: "" });
        // Tiếp tục
        // sendEmailChangePass(user.email, user.name)
        return res.status(200).json({
            success: true,
            message: "Thay đổi mật khẩu thành công"
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: "error message"
        });
    }
}
exports.confirmAdmin = async (req, res) => {
    // ----
    try {
        // Chỉ admin mới dùng hàm này
        const { nPassword, id_user } = req.body

        const user = await User.findOne({
            where:
            {
                id: id_user
            }
        });
        if (!user) return res.status(404).json({
            success: false,
            message: "Not found"
        });
        const hashedPassword = await encryption(nPassword);
        await user.update({ password: hashedPassword, verify: "" });
        // Tiếp tục
        // sendEmailChangePass(user.email, user.name)
        return res.status(200).json({
            success: true,
            message: "Thay đổi mật khẩu thành công"
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: "error message"
        });
    }
}
exports.changePass = async (req, res) => {
    try {
        const { oldPassword, nPassword, id_user } = req.body;

        // Tìm người dùng theo ID
        const user = await User.findOne({
            where: { id: id_user }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Người dùng không tồn tại"
            });
        }

        // So sánh mật khẩu cũ
        const isMatch = await compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu cũ không chính xác"
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await encryption(nPassword);

        // Cập nhật mật khẩu mới và xóa thông tin xác minh nếu có
        await user.update({ password: hashedPassword, verify: "" });

        // Gửi email thông báo thay đổi mật khẩu
        // sendEmailChangePass(user.email, user.name);

        return res.status(200).json({
            success: true,
            message: "Thay đổi mật khẩu thành công"
        });
    } catch (error) {
        console.error("Lỗi khi đổi mật khẩu:", error);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi trong quá trình xử lý"
        });
    }
};
exports.contains = async (req, res) => {
    try {
        const { phone } = req.query;
        const users = await User.findAll({
            where: {
                phone: phone
            }
        });
        if(users.length > 0){
            res.status(200).json({
                success: false
            });
        }else{
            res.status(200).json({
                success: true
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const sendEmailForget = async (email, username, code) => {
    const sender = new EmailSender();
    try {
        const subject = 'Khôi phục tài khoản của bạn';
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #318be0; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Quên mật khẩu</h1>
        </div>
        <div style="padding: 20px;">
          <p>Chào <b>${username}</b>,</p>
          <p>Chúng tôi đã nhận được yêu cầu khôi phục tài khoản của bạn. Để tiếp tục, vui lòng sử dụng mã xác nhận dưới đây:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #318be0; padding: 10px 20px; border: 1px dashed #318be0; border-radius: 8px;">${code}</span>
          </div>
          <p><b>Hướng dẫn:</b></p>
          <ol>
            <li>Sao chép mã xác nhận trên.</li>
            <li>Quay lại trang khôi phục mật khẩu của chúng tôi.</li>
            <li>Nhập mã và làm theo hướng dẫn để đặt lại mật khẩu mới.</li>
          </ol>
          <p>Nếu bạn không yêu cầu khôi phục tài khoản, vui lòng bỏ qua email này. Tài khoản của bạn sẽ được giữ an toàn.</p>
          <p style="margin-top: 20px;">Trân trọng,</p>
          <p><b>Đội ngũ hỗ trợ</b></p>
        </div>
        <div style="background-color: #f8f8f8; color: #777; padding: 10px 20px; text-align: center; font-size: 12px;">
          <p>Email này được gửi tự động từ hệ thống. Vui lòng không trả lời.</p>
          <p>&copy; 2024 Công ty của bạn. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    `;

        const result = await sender.sendEmail({
            to: email,
            subject,
            text: `Chào ${username},\n\nMã xác nhận của bạn là: ${code}\n\nNếu bạn không yêu cầu khôi phục tài khoản, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ hỗ trợ`,
            html: htmlContent,
        });
        console.log('Email sent successfully:', result);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}
const sendEmailChangePass = async (email, username) => {
    const sender = new EmailSender();
    try {
        const subject = 'Mật khẩu của bạn đã được thay đổi thành công';
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #318be0; color: #fff; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Mật khẩu đã được thay đổi thành công!</h1>
            </div>
            <div style="padding: 20px;">
              <p>Xin chào <b>${username}</b>,</p>
              <p>Chúng tôi muốn thông báo rằng mật khẩu tài khoản của bạn trên <b>An Phát Hưng AI</b> đã được thay đổi thành công.</p>
              <p>Nếu bạn đã thực hiện thay đổi này, không cần thực hiện thêm hành động nào.</p>
              <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng liên hệ ngay với chúng tôi qua email <a href="mailto:support@anphathung.ai">support@anphathung.ai</a> để đảm bảo an toàn cho tài khoản của bạn.</p>
              <p>Để tăng cường bảo mật, chúng tôi khuyến nghị:</p>
              <ul style="padding-left: 20px;">
                <li>Không chia sẻ mật khẩu với bất kỳ ai.</li>
                <li>Thay đổi mật khẩu định kỳ.</li>
                <li>Sử dụng mật khẩu mạnh bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</li>
              </ul>
              <p>Hãy tiếp tục khám phá các tính năng của chúng tôi tại <a href="https://anphathung.ai">An Phát Hưng AI</a>.</p>
              <p style="margin-top: 20px;">Trân trọng,</p>
              <p><b>Đội ngũ An Phát Hưng AI</b></p>
            </div>
            <div style="background-color: #f8f8f8; color: #777; padding: 10px 20px; text-align: center; font-size: 12px;">
              <p>Email này được gửi tự động từ hệ thống. Vui lòng không trả lời.</p>
              <p>&copy; 2024 An Phát Hưng AI. Tất cả các quyền được bảo lưu.</p>
            </div>
          </div>
        `;

        const result = await sender.sendEmail({
            to: email,
            subject,
            text: `Xin chào ${username},\n\nMật khẩu tài khoản của bạn trên An Phát Hưng AI đã được thay đổi thành công.\n\nNếu bạn không yêu cầu đổi mật khẩu, vui lòng liên hệ ngay với chúng tôi qua email support@anphathung.ai.\n\nTrân trọng,\nĐội ngũ An Phát Hưng AI`,
            html: htmlContent,
        });

        return { success: true, result };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}
const sendEmailWelcome = async (email, username) => {
    const sender = new EmailSender();
    try {
        const subject = 'Chào mừng đến với An Phát Hưng AI!';
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #2E86C1; color: #fff; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Chào mừng đến với An Phát Hưng AI!</h1>
            </div>
            <div style="padding: 20px;">
              <p>Xin chào <b>${username}</b>,</p>
              <p>Chúng tôi rất vui mừng chào đón bạn đến với <b>An Phát Hưng AI</b>, nền tảng tiên phong ứng dụng trí tuệ nhân tạo (AI) trong lĩnh vực bất động sản tại Việt Nam.</p>
              <p>Tại đây, bạn sẽ được trải nghiệm những công cụ và giải pháp hiện đại giúp tối ưu hóa việc tìm kiếm, quản lý và đầu tư bất động sản. Một số tính năng nổi bật mà bạn có thể khám phá:</p>
              <ul style="padding-left: 20px;">
                <li><b>Phân tích bất động sản:</b> Sử dụng AI để phân tích và định giá chính xác.</li>
                <li><b>Đánh giá danh mục đầu tư:</b> Tối ưu hóa các khoản đầu tư bất động sản của bạn.</li>
                <li><b>Công cụ tìm kiếm thông minh:</b> Dễ dàng tìm kiếm bất động sản phù hợp với nhu cầu.</li>
              </ul>
              <p>Hãy bắt đầu hành trình của bạn với chúng tôi bằng cách đăng nhập và khám phá các tính năng ngay hôm nay!</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://anphathung.ai" style="display: inline-block; background-color: #2E86C1; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-size: 16px;">Khám Phá Ngay</a>
              </div>
              <p>Nếu bạn cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi qua email <a href="mailto:support@anphathung.ai">support@anphathung.ai</a>.</p>
              <p>Chúc bạn thành công và tận hưởng trải nghiệm tuyệt vời tại <b>An Phát Hưng AI</b>.</p>
              <p style="margin-top: 20px;">Trân trọng,</p>
              <p><b>Đội ngũ An Phát Hưng AI</b></p>
            </div>
            <div style="background-color: #f8f8f8; color: #777; padding: 10px 20px; text-align: center; font-size: 12px;">
              <p>Email này được gửi tự động từ hệ thống. Vui lòng không trả lời.</p>
              <p>&copy; 2024 An Phát Hưng AI. Tất cả các quyền được bảo lưu.</p>
            </div>
          </div>
        `;

        const result = await sender.sendEmail({
            to: email,
            subject,
            text: `Chào mừng đến với An Phát Hưng AI, ${username}!\n\nHãy khám phá các tính năng của chúng tôi tại: https://anphathung.ai`,
            html: htmlContent,
        });

        return { success: true, result };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

