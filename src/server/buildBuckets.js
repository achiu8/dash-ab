module.exports = experiments =>
  experiments.reduce((acc, e) => Object.assign({}, acc, {
    [e.name]: e.bucket
  }), {});
