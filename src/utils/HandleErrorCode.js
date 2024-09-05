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
        case "05":
            return `Error:${errorCode}, Thông tin đối tác không hợp lệ`;
        case "06":
            return `Error:${errorCode}, Có lỗi khi generate accessToken`;
        case "07":
            return `Error:${errorCode}, Token không hợp lệ`;
        case "08":
            return `Error:${errorCode}, Có lỗi khi lấy thông tin partner`;
        case "09":
            return `Error:${errorCode}, Not Authenticated`;
        case "10":
            return `Error:${errorCode}, username đã tồn tại`;
        case "11":
            return `Error:${errorCode}, Có lỗi khi tạo account`;
        case "12":
            return `Error:${errorCode}, Account không tồn tại`;
        case "13":
            return `Error:${errorCode}, Có lỗi khi lấy thông tin account`;
        case "14":
            return `Error:${errorCode}, User không tồn tại`;
        case "15":
            return `Error:${errorCode}, Có lỗi khi đăng nhập`;
        case "16":
            return `Error:${errorCode}, Có lỗi khi push kết quả tạo đơn`;
        case "17":
            return `Error:${errorCode}, Có lỗi khi push trạng thái đơn`;
        case "18":
            return `Error:${errorCode}, Có lỗi khi update kết quả tạo đơn`;
        case "19":
            return `Error:${errorCode}, Có lỗi khi update trạng thái đơn`;
        default:
            return "Error: " + errorCode + ", Lỗi không xác định";
    }
}

module.exports = HandleErrorCode