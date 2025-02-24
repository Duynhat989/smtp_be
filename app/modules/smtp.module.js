const nodemailer = require('nodemailer');

class EmailSender {
    constructor() {
        const EMAIL = process.env.PAYMENT_EMAIL
        const PASSWORD = process.env.PAYMENT_PAW
        this.email = EMAIL;
        this.password = PASSWORD;

        // Cấu hình transporter với SMTP của Gmail
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.email,
                pass: this.password,
            },
        });
    }

    async sendEmail({ to, subject, text, html }) {
        try {
            const mailOptions = {
                from: this.email, // Địa chỉ email gửi
                to, // Địa chỉ email nhận
                subject, // Chủ đề email
                text, // Nội dung dạng văn bản
                html, // Nội dung dạng HTML
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', result);
            return result;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}

module.exports = EmailSender;
