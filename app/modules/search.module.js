const properties = [
    { id: 1, keywords: ["city center", "luxury", "pool", "garden"] },
    { id: 2, keywords: ["beachfront", "sunset view", "modern design"] },
    { id: 3, keywords: ["urban area", "shopping mall", "school nearby"] }
];
class SearchBox{
    calculateMatchScore(keywords, searchText) {
        // Chuyển đoạn tìm kiếm và danh sách từ khóa thành chữ thường để so sánh không phân biệt chữ hoa
        const searchWords = searchText.toLowerCase().split(" ");
        const keywordSet = new Set(keywords.map(keyword => keyword.toLowerCase()));
    
        // Tính điểm dựa trên số từ trong đoạn tìm kiếm trùng với từ khóa của bất động sản
        let score = 0;
        searchWords.forEach(word => {
            if (keywordSet.has(word)) {
                score += 1;
            }
        });
    
        return score;
    }
    sortPropertiesByRelevance(properties, searchText) {
        return properties
            .map(property => ({
                ...property,
                matchScore: this.calculateMatchScore(property.keywords, searchText)
            }))
            .sort((a, b) => b.matchScore - a.matchScore); // Sắp xếp giảm dần theo điểm khớp
    }
    searchActive(){
        const searchText = "luxury pool city center";
    
        const sortedProperties = sortPropertiesByRelevance(properties, searchText);
        console.log(sortedProperties);
    }
}

module.exports = {
    SearchBox
}