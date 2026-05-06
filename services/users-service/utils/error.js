function makeError(id, message, status = 400) {
  const err = new Error(message);
  err.errorId = id;
  err.status = status;
  return err;
}

function errorToJson(error) {
  return {
    id: error.errorId || "internal_error",
    message: error.message || "Unexpected server error"
  };
}

module.exports = { makeError, errorToJson };
