class Feature {
    constructor(myObj){
        this.myObj = myObj
    }
    async find(id = 0,type="assistant"){
        for (let index = 0; index < this.myObj.length; index++) {
            const obj = this.myObj[index];
            if(obj.type == type && obj.id == id){
                return obj
            }
        }
        return null
    }
    async add(id = 0,type="assistant"){
        this.myObj.push({
            type:type,
            id:id
        })
    }
    async remove(type, id) {
        for (let index = 0; index < this.myObj.length; index++) {
            const obj = this.myObj[index];
            if (obj.type === type && obj.id === id) {
                this.myObj.splice(index, 1); // Xóa phần tử tại vị trí `index`
                return true; // Trả về phần tử đã xóa
            }
        }
        return false; // Trả về null nếu không tìm thấy
    }
}
module.exports = {
    Feature
}