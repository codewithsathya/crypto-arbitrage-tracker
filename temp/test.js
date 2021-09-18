const axios = require("axios");
const coins = require("./coins.json");

const { getDepthData } = require("./services/wazirxApi");
const {
  convertArrayToObject,
  binanceMapping,
  getQuoteData: getQuoteDataBinance,
  setValues,
} = require("./utils/binanceUtils");
const { getQuoteData, map } = require("./utils/wazirxUtils");

let wazirx = coins.wazirxApiDetails;
let binance = coins.binanceApiDetails;

let b2wCoinsObj = coins.b2wCoinsObject;

async function getAllData() {
  let arr = [];
  try {
    arr[0] = await axios.get(wazirx.baseUrl + wazirx.marketStatus);
  } catch (error) {
    console.log("wazirx error");
  }
  try {
    arr[1] = await axios.get(binance.baseUrl + binance.allTickers);
  } catch (error) {
    console.log("Binance Error");
  }
  return arr;
}

function getFinalDiffData(buyData, sellData, threshold = 0, coins) {
  if (!coins) coins = Object.keys(buyData);
  let result = [];
  for (let coin of coins) {
    // console.log(buyData[coin]);
    for (let buyQuote of buyData[coin].quotes) {
      for (let sellQuote of sellData[coin].quotes) {
        let buyPrice = buyData[coin].priceData[buyQuote].buy;
        let sellPrice = sellData[coin].priceData[sellQuote].sell;
        let percentChange = ((sellPrice - buyPrice) / buyPrice) * 100;
        if (percentChange >= threshold) {
          result.push({
            coin,
            buyQuote,
            sellQuote,
            buyPrice,
            sellPrice,
            percentChange,
          });
        }
      }
    }
  }
  return result;
}

async function show() {
  let exchangeInfoResponse;
  try {
    exchangeInfoResponse = await axios.get(
      binance.baseUrl + binance.exchangeInfo
    );
  } catch (error) {
    console.log("Exchange info error");
    console.log(error);
  }
  let exchangeInfo = exchangeInfoResponse.data;
  let symbols = exchangeInfo["symbols"];
  // console.log(Object.keys(binanceMapping(symbols)).length);
  // console.time("time");
  let mappedBinance = binanceMapping(symbols);
  // console.timeEnd("time");

  let apiData = await getAllData();
  let wazirxData = apiData[0].data;
  let binanceData = apiData[1].data;

  let filtered = wazirxData.markets.filter((item) => {
    return item.status === "active" && item.type === "SPOT";
  });

  let quoteDataWazirx = getQuoteData(filtered, binanceData);
  let mappedWazirx = map(filtered, quoteDataWazirx);
  // console.log(Object.keys(mappedBinance).length);
  for (let coin of Object.keys(mappedBinance)) {
    if (!mappedWazirx[coin]) {
      delete mappedBinance[coin];
    }
  }
  for (let coin of Object.keys(mappedWazirx)) {
    if (!mappedBinance[coin]) {
      delete mappedWazirx[coin];
    }
  }
  let binanceObjData = convertArrayToObject(binanceData);
  let binanceQuotes = coins.binanceQuotes;
  let quoteDataBinance = getQuoteDataBinance(binanceQuotes, binanceObjData);
  let binanceFinal = setValues(mappedBinance, binanceObjData, quoteDataBinance);
  // console.log(Object.keys(mappedBinance).length);
  // console.log(Object.keys(mappedWazirx).length);

  // console.log(JSON.stringify(mappedWazirx),"\n\n", JSON.stringify(binanceFinal));
  console.time("start");
  let result = getFinalDiffData(mappedWazirx, binanceFinal, 0.5);
  console.timeEnd("start");
  // let result = getFinalDiffData(binanceFinal, mappedWazirx,0.5);
  console.log(result);
}



show();