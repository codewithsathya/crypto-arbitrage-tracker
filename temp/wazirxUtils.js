function map(arr, quoteData) {
  let obj = {};
  for (let item of arr) {
    let base = item.baseMarket;
    let quote = item.quoteMarket;
    if (!obj[base]) {
      obj[base] = {
        priceData: {},
        quotes: [],
      };
    }
    obj[base].quotes.push(quote);

    obj[base].priceData[quote] = {buy: item.sell * quoteData[quote].buy, sell: item.buy * quoteData[quote].sell};
  }
  return obj;
}

function getQuoteData(wazirxData, binanceData){
  let obj = {};
  let combined = binanceData.filter(item => {
    return item.symbol === "WRXUSDT" || item.symbol === "BTCUSDT";
  })

  let inr = wazirxData.filter(item => item.baseMarket === "usdt" && item.quoteMarket === "inr" && item.type === "SPOT")[0];
  let wrx = combined.filter(item => item.symbol === "WRXUSDT")[0];
  let btc = combined.filter(item => item.symbol === "BTCUSDT")[0];
  
  obj.inr = {buy: 1 / parseFloat(inr.buy), sell: 1 / parseFloat(inr.sell)};
  obj.wrx = {buy: parseFloat(wrx.askPrice), sell: parseFloat(wrx.bidPrice)};
  obj.btc = {buy: parseFloat(btc.askPrice), sell: parseFloat(btc.bidPrice)};
  obj.usdt = {buy: 1, sell: 1};

  return obj;
}

module.exports = {
	map, 
	getQuoteData
}