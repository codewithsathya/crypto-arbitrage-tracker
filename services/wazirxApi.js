const axios = require("axios");

async function getDepthData(arr) {
  let data = arr.map((pair) => {
    return axios.get(
      `https://x.wazirx.com/api/v2/depth?limit=10&market=${pair}`
    );
  });
  return Promise.all(data);
}

module.exports = {
	getDepthData
}