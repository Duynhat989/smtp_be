const fs = require('fs');
const path = require('path');

class FileLocal {
    constructor(myKey) {
        this.myKey = myKey;
    }
    async saveBase64Image(base64Data, fileName) {
        return new Promise((resolve, reject) => {
            const base64String = base64Data.replace(/^data:image\/png;base64,/, "");
            // Tạo đường dẫn lưu file
            const filePath = path.join(__dirname, 'public/stores/images', `${fileName}.png`);
            // Ghi file
            fs.writeFile(filePath, base64String, 'base64', (err) => {
                if (err) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            });
        })
    }
    // Cập nhật file 
    async uploadFile(file, fileName) {
        // Hàm upload file, hỗ trợ nhiều đuôi file như .pdf, .xlsx, .docx
        return new Promise((resolve, reject) => {
            const allowedExtensions = ['.pdf', '.xlsx', '.docx'];
            const ext = path.extname(file.originalname);
            if (!allowedExtensions.includes(ext.toLowerCase())) {
                return resolve(false); // Không hỗ trợ loại file này
            }
            const newFileName = `${fileName}${ext}`;
            const filePath = path.join(__dirname, 'public/stores/files', newFileName);

            fs.writeFile(filePath, file.buffer, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(newFileName);
                }
            });
        });
    }
}
module.exports = {
    FileLocal
}