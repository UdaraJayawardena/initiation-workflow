module.exports = (dataSource) => ({
  ...require(`./${dataSource}`)
}); 