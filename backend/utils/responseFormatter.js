exports.success = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

exports.error = (message, statusCode = 500) => ({
  success: false,
  message,
  statusCode
});

exports.paginate = (data, page, limit, total) => ({
  success: true,
  data,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
});