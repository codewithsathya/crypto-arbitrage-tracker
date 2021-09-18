const express = require("express");
const app = express();

const config = require("./config/config.json");
const { filterCommonCoins } = require("./utils/biExchangeUtils");
const { intitialize, calculateArbitrage } = require("./getBiData");

let exchangesCoinData = {};
let exchangesQuoteData = {};
let arbitrageData = {};
const exchanges = config.exchanges;


app.get("/all", (req, res) => {
  res.send(arbitrageData);
})

app.get("/wazirxbinance", (req, res) => {
  res.send(arbitrageData["wazirxbinance"]);
})

app.get("/binancewazirx", (req, res) => {
  res.send(arbitrageData["binancewazirx"]);
})

app.get("/wazirxwazirx", (req, res) => {
  res.send(arbitrageData["wazirxwazirx"]);
})

app.get("/binancebinance", (req, res) => {
  res.send(arbitrageData["binancebinance"]);
})

async function show() {
  await intitialize(exchangesCoinData, exchangesQuoteData, exchanges);
  filterCommonCoins(exchangesCoinData, "wazirx", "binance");
  startRepeater();
}
async function startRepeater() {
  await calculateArbitrage(
    exchangesCoinData,
    exchangesQuoteData,
    exchanges,
    arbitrageData,
		config.threshold
  );
  setTimeout(startRepeater, config.refreshTime);
}

show();

module.exports = {
  app,
}