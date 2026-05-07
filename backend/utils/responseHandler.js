const successResponse = (res, msg, data, statusCode = 200) => {
    return  res.status(statusCode).json({
        success:true,
        message:msg,
        data:data
    })
}

const errorResponse = (res, msg, statusCode = 400) => {
    return res.status(statusCode).json({
        success:false,
        message:msg
    })
}

module.exports = {successResponse, errorResponse}