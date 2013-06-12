var cradle = require('cradle');

module.exports = function () {
	return new(cradle.Connection)('https://database.com', 80, {
      cache: true,
      raw: false
  }).database('narwhal-test');
}
