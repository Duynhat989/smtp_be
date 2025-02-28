const { Smtps, Schedules, Emails } = require('../app/models')
const EmailSender = require('../app/modules/smtps.module')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms * 100));

const emailManager = require('../app/modules/smtpManager.module');
const senderEmail = async (order, customer) => {
    let smtp = await emailManager.getSmtp()
    if (smtp) {
        console.log(customer)
        const sender = new EmailSender(smtp.email, smtp.password)
        const checked = await sender.checkAccount();
        if (!checked) {
            // Lỗi smtp xử lý sao đó
        }
        let newInbox = async (email, keywords) => {
            let htmlBase = order.html
            // Thêm trình random class tránh quét nội dung
            htmlBase = htmlBase.split(`@@email@@`).join(`${email}`)
            for (const keyword of keywords) {
                htmlBase = htmlBase.split(`${keyword.name}`).join(`${keyword.value}`)
            }
            return htmlBase
        }
        let htmlSend = await newInbox(customer.mail, JSON.parse(customer.config).keywords)
        let dataSend = await sender.sendEmail({
            to: customer.mail,
            subject: order.subject,
            html: htmlSend,
            from: order.business
        })
        console.log("dataSend", dataSend.accepted);
        if (JSON.stringify(dataSend.accepted).length > 10) {
            console.log('Vào inbox')
            await Emails.update(
                { status: 2 },
                { where: { id: customer.id } }
            );
        } else {
            console.log("Vào spam nè")
            await Emails.update(
                { status: 3 },
                { where: { id: customer.id } }
            );
        }
    }
};
const OrderManeger = new Set(); // Dùng Set để tối ưu kiểm tra

const getIdOrder = async () => {
    // Lấy danh sách có status = 2
    let dules = await Schedules.findAll({
        where: { status: 2 },
        attributes: ["id", "name", "timezone", "html", "subject", "business", "startDate", "endDate", "telegramBot"],
        order: [["createdAt", "ASC"]],
    });

    // Lọc ra các id chưa có trong OrderManeger
    let tempDules = dules.filter(dule => !OrderManeger.has(dule.id));
    if (tempDules.length > 0) {
        OrderManeger.add(tempDules[0].id); // Dùng Set để thêm
        return tempDules[0];
    }

    // Nếu không có status = 2, tìm tiếp status = 1
    dules = await Schedules.findAll({
        where: { status: 1 },
        attributes: ["id", "name", "timezone", "html", "subject", "business", "startDate", "endDate", "telegramBot"],
        order: [["createdAt", "ASC"]],
        limit: 1,
    });

    if (dules.length > 0) {
        await Schedules.update(
            { status: 2 },
            { where: { id: dules[0].id } }
        );
        OrderManeger.add(dules[0].id);
        return dules[0];
    }

    return null;
};

const processSmtpWorker = async () => {
    while (true) {
        console.log(OrderManeger)
        let order = await getIdOrder()
        // 
        if (order) {
            while (true) {
                let emails = await Emails.findAll({
                    where: {
                        status: 1
                    },
                    limit: 10
                })
                if (emails.length == 0) {
                    // Het dừng
                    await Schedules.update(
                        { status: 3 },
                        { where: { id: order.id } }
                    );
                    break
                }
                // Gửi bắt đầu gửi email 
                for (let index = 0; index < emails.length; index++) {
                    // gửi từng email 1
                    let mail = emails[index]
                    await senderEmail(order, {
                        id: mail.id,
                        mail: mail.email,
                        config: mail.config
                    })
                }
                await sleep(30)
            }




            try { OrderManeger.delete(order.id); } catch (error) { }
        }
        // sau kho ok thì xóa id ra khởi OrderManeger

        await sleep(10);
    }
};


// let smtps = await Smtps.findAll({
//     where: { status: 1 }
// });

// if (smtps.length === 0) {
//     console.log("Không có SMTP nào khả dụng.");
//     return;
// }

// let randomIndex = Math.floor(Math.random() * smtps.length);
// const sender = new EmailSender(
//     smtps[randomIndex].email,
//     smtps[randomIndex].password.split(' ').join('')
// );

// await senderEmail(sender, orderProccess);



// Số giây 10s
const processSmtp = async () => {
    const numWorkers = 3; // Số luồng chạy song song
    for (let index = 0; index < numWorkers; index++) {
        setTimeout(() => {
            processSmtpWorker(index)
        }, index * 2000)
    }
};

module.exports = { processSmtp };
