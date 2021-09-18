function filterCommonCoins(exchangesCoinData, exchange1, exchange2) {
  for (let coin of Object.keys(exchangesCoinData[exchange1])) {
    if (!exchangesCoinData[exchange2][coin]) {
      delete exchangesCoinData[exchange1][coin];
    }
  }
  for (let coin of Object.keys(exchangesCoinData[exchange2])) {
    if (!exchangesCoinData[exchange1][coin]) {
      delete exchangesCoinData[exchange2][coin];
    }
  }
}

module.exports = {
	filterCommonCoins
}