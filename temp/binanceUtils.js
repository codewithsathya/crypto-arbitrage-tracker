function convertArrayToObject(arr) {
  let obj = {};
  for (let item of arr) {
    obj[item.symbol.toLowerCase()] = {
      buy: parseFloat(item.askPrice),
      sell: parseFloat(item.bidPrice),
    };
  }
  return obj;
}

function binanceMapping(arr) {
  let obj = {};
  for (let item of arr) {
    if (item.status !== "TRADING") {
      continue;
    }
    let base = item.baseAsset.toLowerCase();
    let quote = item.quoteAsset.toLowerCase();
    if (!obj[base]) {
      obj[base] = {
        priceData: {},
        quotes: [],
      };
    }
		if(quote === "vai") continue;
    obj[base].quotes.push(quote);
  }
  return obj;
}

function getQuoteData(quotes, binanceData) {
  let mainQuote = quotes.mainQuote;
  let normalQuotes = quotes.normalQuotes,
    inverseQuotes = quotes.inverseQuotes;
  let obj = {};
  for (let quote of normalQuotes) {
    let quoteData = binanceData[quote + mainQuote];
    obj[quote] = {
      buy: parseFloat(quoteData.buy),
      sell: parseFloat(quoteData.sell),
    };
  }
  for (let quote of inverseQuotes) {
    let quoteData = binanceData[mainQuote + quote];
    obj[quote] = {
      buy: 1 / parseFloat(quoteData.sell),
      sell: 1 / parseFloat(quoteData.buy),
    };
  }
  obj[mainQuote] = { buy: 1, sell: 1 };
  return obj;
}

function setValues(obj, binanceData, quoteData) {
  for (let coin of Object.keys(obj)) {
    for (let quote of obj[coin].quotes) {
			// console.log(binanceData[coin + quote]);
			if(quote === "vai") continue;
      obj[coin].priceData[quote] = {
        buy: binanceData[coin + quote].buy * quoteData[quote].buy,
        sell: binanceData[coin + quote].sell * quoteData[quote].sell,
      };
			// if(!quoteData[quote]) console.log(quote);
			// console.log(binanceData[coin + quote].buy, quoteData[quote].buy);
    }
  }
  return obj;
}

module.exports = {
  convertArrayToObject,
  binanceMapping,
  getQuoteData,
  setValues,
};
