// api response
class ApiResponse{
    constructor(statusCode,data,message="") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.succuss = statusCode < 400;
    }
}