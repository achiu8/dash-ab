module.exports = experiments =>
  experiments.reduce((acc, e) => Object.assign({}, acc, {
    [e.name]: {
      status: e.status,
      resolved: e.resolved_variant,
      variants: e.config
    }
  }), {});
