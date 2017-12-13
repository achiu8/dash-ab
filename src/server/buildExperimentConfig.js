module.exports = variants =>
  variants.reduce((acc, variant) => Object.assign({}, acc, {
    [variant.name]: variant.weight
  }), {});
