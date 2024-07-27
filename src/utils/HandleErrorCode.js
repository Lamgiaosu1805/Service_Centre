const HandleErrorCode = (errorCode) => {
    switch (errorCode) {
        case "01":
            return "Error:01, Có lỗi khi lấy danh sách Tỉnh - Thành Phố";
        case "02":
            return "Error:02, Có lỗi khi lấy danh sách Quận - Huyện";
        case "03":
            return `Error:${errorCode}, Đẩy đơn thất bại`;
        case "04":
            return `Error:${errorCode}, Có lỗi khi đẩy đơn sang F88`;
    
        default:
            return "Error: " + errorCode + ", Lỗi không xác định";
    }
}

module.exports = HandleErrorCode