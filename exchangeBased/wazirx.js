function mapExchangeInfo(coinsInfo, exchangeDetails) {
  let mappedData = {};
  const filteredMarkets = coinsInfo["markets"].filter(
    (pairData) =>
      pairData["status"] === "active" &&
      pairData["type"] === "SPOT" &&
      !exchangeDetails.quotes["ignoredQuotes"].includes(pairData["quoteAsset"]) &&
      !exchangeDetails.quotes["ignoredQuotes"].includes(pairData["baseAsset"])
  );
  for (pairData of filteredMarkets) {
    const base = pairData.baseMarket;
    const quote = pairData.quoteMarket;
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
  for(let symbol of Object.keys(tickersData)){
    result[symbol] = {
      buy: parseFloat(tickersData[symbol].sell),
      sell: parseFloat(tickersData[symbol].buy)
    }
  }
  return result;
}

module.exports = {
  mapExchangeInfo,
  mapTickers
};
