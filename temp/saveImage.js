const fs = require("fs");
const path = require("path");
const axios = require("axios");

let arr = [];
async function downloadImg(url) {
  const fileName = path.basename(url.replace("?v=013", ""));
  const localFilePath = path.resolve(__dirname, "images", fileName);
  const writer = fs.createWriteStream(localFilePath);
  try {
    const response = await axios({
      method: "GET",
      url,
      responseType: "stream",
    });
    response.data.pipe(writer);
    return new Promise((res, rej) => {
      writer.on("finish", res);
      writer.on("error", rej);
    });
  } catch (err) {
		arr.push(url);
  }
}

module.exports = {
	downloadImg
}
