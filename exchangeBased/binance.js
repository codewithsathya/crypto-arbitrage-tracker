function mapExchangeInfo(coinsInfo, exchangeDetails) {
  let mappedData = {};
  const filteredMarkets = coinsInfo["symbols"].filter(
    (pairData) =>
      pairData["status"] === "TRADING"
  );

  for (pairData of filteredMarkets) {
    const base = pairData["baseAsset"].toLowerCase();
    const quote = pairData["quoteAsset"].toLowerCase();

    if(exchangeDetails.quotes["ignoredQuotes"].includes(base) || exchangeDetails.quotes["ignoredQuotes"].includes(quote)) continue;
    if (!mappedData[base]) {
      mappedData[base] = {
        priceData: {},
        quotes: [],
      };
    }
    mappedData[base].quotes.push(quote);
    mappedData[base].priceData[quote] = { buy: 0, sell: 0 };
  }
  return mappedData;
}

function mapTickers(tickersData){
  let result = {};
  for(let pairData of tickersData){
    result[pairData["symbol"].toLowerCase()] = {
      buy: parseFloat(pairData["askPrice"]),
      sell: parseFloat(pairData["bidPrice"])
    }
  }
  return result;
}

module.exports = {
  mapExchangeInfo,
  mapTickers
};
