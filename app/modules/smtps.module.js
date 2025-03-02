const nodemailer = require('nodemailer');

class EmailSender {
    constructor(email, password, type = 'gmail', config = null) {
        this.email = email;
        this.password = password;

        const supportedServices = ['gmail', 'hotmail', 'yahoo'];

        // Cấu hình cơ bản
        const baseConfig = {
            auth: {
                user: this.email,
                pass: this.password,
            },
            // Thêm headers để theo dõi
            headers: {
                'X-Priority': 1,
                'X-MSMail-Priority': 'High',
                'X-Mailer': 'Custom-Mailer',
                'Disposition-Notification-To': email, // Yêu cầu thông báo đã đọc
                'Return-Receipt-To': email // Yêu cầu xác nhận đã nhận
            }
        };

        if (supportedServices.includes(type.toLowerCase())) {
            this.transporter = nodemailer.createTransport({
                service: type.toLowerCase(),
                ...baseConfig
            });
        } else if (config) {
            this.transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure || false,
                ...baseConfig,
                ...config.additionalOptions
            });
        } else {
            throw new Error('Invalid email service configuration');
        }
    }

    async checkAccount() {
        try {
            await this.transporter.verify();
            console.log('Account is valid.');
            return true;
        } catch (error) {
            console.error('Error verifying account:', error);
            return false;
        }
    }

    async sendEmail({ to, subject, html, from, m_id }) {
        try {
            // Kiểm tra API_HREF trước khi sử dụng
            let trackingFollow = process.env.API_HREF
                ? `<img src="${process.env.API_HREF}api/tracking/${to}?m_id=${m_id}" width="1" height="1" style="display:none;">`
                : '';

            const mailOptions = {
                from: from ? `"${from}" <${this.email}>` : this.email,
                to,
                subject,
                html: `${html} ${trackingFollow}`,
                dsn: {
                    id: Date.now(),
                    return: 'headers',
                    notify: ['success', 'failure', 'delay'],
                    recipient: this.email
                },
                headers: {
                    'X-PM-Tag': `tracking-${Date.now()}`,
                    'List-Unsubscribe': `<mailto:${this.email}?subject=unsubscribe>`
                }
            };

            if (!this.transporter) {
                throw new Error('Transporter is not initialized');
            }

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', result);

            // Kiểm tra email header
            const headers = result.response || '';
            console.log("headers: ", headers)
            let spamCheck = {
                spf: headers.includes('spf=pass') ? 'Pass' : 'Fail',
                dkim: headers.includes('dkim=pass') ? 'Pass' : 'Fail',
                dmarc: headers.includes('dmarc=pass') ? 'Pass' : 'Fail',
                spamStatus: headers.includes('X-Spam-Status: No') ? 'Not Spam' : 'Spam'
            };
            console.log("spamCheck: ", spamCheck)
            // Phân tích kết quả gửi
            const deliveryStatus = {
                messageId: result.messageId,
                accepted: result.accepted,
                rejected: result.rejected,
                pending: result.pending,
                response: result.response
            };

            return {
                ...result,
                deliveryStatus,
                trackingEnabled: true
            };
        } catch (error) {
            console.error('Error sending email:', {
                message: error.message,
                stack: error.stack,
                response: error.response || 'No response'
            });
            throw error;
        }
    }


    // Phương thức để kiểm tra trạng thái email
    async checkEmailStatus(messageId) {
        // Note: Việc kiểm tra trạng thái cụ thể (inbox/spam) phụ thuộc vào:
        // 1. Hỗ trợ từ email service provider
        // 2. Cấu hình DKIM, SPF, DMARC
        // 3. Reputation của domain gửi

        try {
            // Có thể implement logic kiểm tra tùy thuộc vào service
            // Ví dụ: sử dụng Gmail API nếu dùng Gmail

            return {
                messageId,
                status: 'sent', // Trạng thái cơ bản
                // Các thông tin khác sẽ phụ thuộc vào khả năng của email service
            };
        } catch (error) {
            console.error('Error checking email status:', error);
            throw error;
        }
    }
}

module.exports = EmailSender;