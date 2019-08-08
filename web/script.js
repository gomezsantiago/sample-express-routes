const socket = io("http://localhost:8039");

const results = document.querySelector(".socket-data");
const btn = document.getElementById("theButton");
const search = document.getElementById("search");
var symbol = "";


socket.on("api-data", (response)=>{
  const data = response[0];

  const incomingData = 
    Object.entries(data)
      .map((entry) => `${entry[0]}: ${entry[1]}`);
  
  results.innerHTML = incomingData.join("<br>");
});

search.addEventListener('change', ({target})=>{
  symbol = target.value;
  socket.emit('clientRequestStock',symbol);
});

// {
//   symbol: 'FB',
//   sector: 'mediaentertainment',
//   securityType: 'commonstock',
//   bidPrice: 173,
//   bidSize: 100,
//   askPrice: 189.74,
//   askSize: 100,
//   lastUpdated: 1565293565360,
//   lastSalePrice: 189.72,
//   lastSaleSize: 100,
//   lastSaleTime: 1565293561209,
//   volume: 368884,
//   marketPercent: 0.0332
// }