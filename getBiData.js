const axios = require("axios");
const exchangeDetails = require("./config/exchangeDetails.json");
const config = require("./config/config.json");

async function intitialize(exchangesCoinData, exchangesQuoteData, exchanges) {
  //sets exchangesCoinData
  for (let exchange of exchanges) {
    exchangesCoinData[exchange] = await getCoinsInfo(exchange);
  }

  //sets exchangesQuoteData
  for (let exchange of exchanges) {
    exchangesQuoteData[exchange] = {};
    for (let quote of exchangeDetails[exchange]["quotes"]["normalQuotes"]) {
      exchangesQuoteData[exchange][quote] = { buy: 0, sell: 0 };
    }
    for (let quote of exchangeDetails[exchange]["quotes"]["invertedQuotes"]) {
      exchangesQuoteData[exchange][quote] = { buy: 0, sell: 0 };
    }
    exchangesQuoteData[exchange][config.mainQuote] = { buy: 1, sell: 1 };
  }
}

async function getCoinsInfo(exchangeName) {
  const { mapExchangeInfo } = require(`./exchangeBased/${exchangeName}`);
  const { apiDetails } = exchangeDetails[exchangeName];
  let exchangeInfo;
  await axios
    .get(apiDetails.baseUrl + apiDetails.exchangeInfo)
    .then((res) => (exchangeInfo = res.data))
    .catch((err) => {
      console.log(err);
      return;
    });
  return mapExchangeInfo(exchangeInfo, exchangeDetails[exchangeName]);
}

async function calculateArbitrage(
  exchangesCoinData,
  exchangesQuoteData,
  exchanges,
  arbitrageData,
  threshold
) {
  let mappedTickers = getMappedTickers(await getTickersData(exchanges));
  setQuoteValues(exchangesQuoteData, mappedTickers);
  setCoinValues(exchangesCoinData, exchangesQuoteData, mappedTickers);
  setArbitrageData(arbitrageData, exchangesCoinData, threshold);
}

async function getTickersData(exchanges) {
  let tickers = {};
  await collectTickersData(exchanges).then((res) => {
    for (let i in exchanges) {
      tickers[exchanges[i]] = res[i]["data"];
    }
  });
  return tickers;
}

function getMappedTickers(tickersData) {
  let result = {};
  for (let exchangeName of Object.keys(tickersData)) {
    const { mapTickers } = require(`./exchangeBased/${exchangeName}`);
    result[exchangeName] = mapTickers(tickersData[exchangeName]);
  }
  return result;
}

function setQuoteValues(exchangesQuoteData, mappedTickers) {
  let mainExchange = "binance";

  let exchange = "wazirx";
  for (let quote of exchangeDetails[exchange]["quotes"]["normalQuotes"]) {
    exchangesQuoteData[exchange][quote].buy =
      mappedTickers[mainExchange][quote + config.mainQuote].buy;
    exchangesQuoteData[exchange][quote].sell =
      mappedTickers[mainExchange][quote + config.mainQuote].sell;
  }
  for (let quote of exchangeDetails[exchange]["quotes"]["invertedQuotes"]) {
    exchangesQuoteData[exchange][quote].buy =
      1 / mappedTickers[exchange][config.mainQuote + quote].sell;
    exchangesQuoteData[exchange][quote].sell =
      1 / mappedTickers[exchange][config.mainQuote + quote].buy;
  }

  exchange = "binance";
  for (let quote of exchangeDetails[exchange]["quotes"]["normalQuotes"]) {
    exchangesQuoteData[exchange][quote].buy =
      mappedTickers[exchange][quote + config.mainQuote].buy;
    exchangesQuoteData[exchange][quote].sell =
      mappedTickers[exchange][quote + config.mainQuote].sell;
  }
  for (let quote of exchangeDetails[exchange]["quotes"]["invertedQuotes"]) {
    exchangesQuoteData[exchange][quote].buy =
      1 / mappedTickers[exchange][config.mainQuote + quote].sell;
    exchangesQuoteData[exchange][quote].sell =
      1 / mappedTickers[exchange][config.mainQuote + quote].buy;
  }
}

function setArbitrageData(arbitrageData, exchangesCoinData, threshold) {
  arbitrageData["wazirxbinance"] = getArbitrageData(
    exchangesCoinData,
    "wazirx",
    "binance",
    threshold
  );
  arbitrageData["binancewazirx"] = getArbitrageData(
    exchangesCoinData,
    "binance",
    "wazirx",
    threshold
  );
  arbitrageData["wazirxwazirx"] = getArbitrageData(
    exchangesCoinData,
    "wazirx",
    "wazirx",
    threshold
  );
  arbitrageData["binancebinance"] = getArbitrageData(
    exchangesCoinData,
    "binance",
    "binance",
    threshold
  );
}

function setCoinValues(exchangesCoinData, exchangesQuoteData, mappedTickers) {
  for (let exchange of Object.keys(exchangesCoinData)) {
    for (let coin of Object.keys(exchangesCoinData[exchange])) {
      for (let quote of Object.keys(
        exchangesCoinData[exchange][coin]["priceData"]
      )) {
        exchangesCoinData[exchange][coin]["priceData"][quote]["buy"] =
          mappedTickers[exchange][coin + quote]["buy"] *
          exchangesQuoteData[exchange][quote]["buy"];
        exchangesCoinData[exchange][coin]["priceData"][quote]["sell"] =
          mappedTickers[exchange][coin + quote]["sell"] *
          exchangesQuoteData[exchange][quote]["sell"];
      }
    }
  }
}


function getArbitrageData(exchangesCoinData, exchange1, exchange2, threshold) {
  let result = [];
  for (let coin of Object.keys(exchangesCoinData[exchange1])) {
    for (let buyQuote of exchangesCoinData[exchange1][coin]["quotes"]) {
      for (let sellQuote of exchangesCoinData[exchange2][coin]["quotes"]) {
        let buy = exchangesCoinData[exchange1][coin].priceData[buyQuote].buy;
        let sell = exchangesCoinData[exchange2][coin].priceData[sellQuote].sell;
        let gain = ((sell - buy) / buy) * 100;
        if (gain > threshold) {
          let obj = {
            coin,
            buyAt: exchange1,
            buyQuote,
            buyPrice: buy,
            sellAt: exchange2,
            sellQuote,
            sellPrice: sell,
            gain: gain.toPrecision(2),
          };
          result.push(obj);
        }
      }
    }
  }
  return result;
}

async function collectTickersData(exchanges) {
  let tickers = [];
  for (let exchange of exchanges) {
    let apiDetails = exchangeDetails[exchange].apiDetails;
    tickers.push(axios.get(apiDetails.baseUrl + apiDetails.tickers));
  }
  return Promise.all(tickers);
}

module.exports = {
  calculateArbitrage,
  intitialize,
};
