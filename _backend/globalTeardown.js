module.exports = async function () {
  const instance = global.__MONGOINSTANCE;
  await instance.stop();
};
