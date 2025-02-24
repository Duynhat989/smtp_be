const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph } = require('docx');

class WordProcessor {
    constructor() {}

    async replaceAndDownload(templatePath, replacement, outputFileName) {
        return new Promise((resolve, reject) => {
            // Đọc file Word mẫu
            fs.readFile(templatePath, 'binary', async (err, data) => {
                if (err) {
                    return reject('Không thể đọc file mẫu');
                }

                // Tạo tài liệu mới từ file mẫu
                let doc = new Document();
                let text = data.toString(); // Convert nội dung file Word thành chuỗi text
                let replacedText = text.replace('<@name>', replacement); // Thay thế <@name> bằng tên thật

                // Thêm nội dung thay thế vào tài liệu
                doc.addSection({
                    children: [
                        new Paragraph({
                            text: replacedText,
                        }),
                    ],
                });

                // Lưu tài liệu mới đã thay thế
                const buffer = await Packer.toBuffer(doc);

                // Đường dẫn lưu file output
                const filePath = path.join(__dirname, 'public/stores/files', `${outputFileName}.docx`);

                fs.writeFile(filePath, buffer, (err) => {
                    if (err) {
                        return reject('Không thể lưu file');
                    }
                    resolve(filePath); // Trả về đường dẫn file đã được lưu
                });
            });
        });
    }
}

module.exports = {
    WordProcessor
};

// Ví dụ sử dụng
// const processor = new WordProcessor();
// processor.replaceAndDownload('./template.docx', 'Duy', 'output')
//     .then((filePath) => {
//         console.log(`File đã được lưu tại: ${filePath}`);
//     })
//     .catch((err) => {
//         console.error(err);
//     });
