const wrapper = (fn) => (req, res, next) => {
  if (fn.constructor.name === "AsyncFunction") {
    return fn(req, res, next).catch((e) => {
      next(e);
    });
  } else {
    try {
      fn(req, res, next);
    } catch (e) {
      next(e);
    }
  }
};

module.exports = wrapper;
