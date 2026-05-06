function errorToJson(error) {
  return {
    id: error.errorId || "internal_error",
    message: error.message || "Unexpected server error"
  };
}

module.exports = { errorToJson };
