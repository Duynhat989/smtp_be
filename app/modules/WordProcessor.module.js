const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

class WordProcessor {
  constructor(xpath) {
    this.xpath = xpath;
  }

  async readAndReplace(replacements) {
    try {
      // Đọc file .docx vào buffer
      const content = fs.readFileSync(this.xpath, 'binary');
      const zip = new PizZip(content);

      // Khởi tạo docxtemplater từ zip đã đọc
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: "<@",
          end: "@>"
        }
      });

      // Thay thế từ khóa trong file .docx
      console.log(replacements)
      doc.setData(replacements);

      try {
        doc.render();
      } catch (error) {
        console.error("Lỗi khi render file Word:", error);
        return;
      }

      // Xuất file đã thay thế vào buffer
      const replacedBuffer = doc.getZip().generate({ type: 'nodebuffer' });
      // fs.writeFileSync(this.xpath, replacedBuffer);
      console.log("Nội dung đã được thay thế thành công!");
      // this file 
      return replacedBuffer
    } catch (error) {
      console.error("Lỗi khi đọc hoặc thay thế file Word:", error);
      return false
    }
  }
}

module.exports = {
  WordProcessor
};

// Sử dụng class
// const processor = new WordProcessor('path/to/your/document.docx');
// processor.readAndReplace({
//   "từ khóa 1": "giá trị thay thế 1",
//   "từ khóa 2": "giá trị thay thế 2",
// });
