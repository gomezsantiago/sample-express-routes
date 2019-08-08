const socket = io("http://localhost:8039");

const results = document.querySelector(".socket-data");

socket.on("get-data", (data)=>{

  const incomingData = [];

  incomingData.push(`Date: ${data.date}`);
  incomingData.push(`Nanoseconds : ${data.nanoseconds}`);
  incomingData.push(`Ticker : ${data.ticker}`);
  incomingData.push(`Bid Size : ${data.bidsize}`);
  incomingData.push(`Bid Price : ${data.bidprice}`);
  incomingData.push(`Mid Price : ${data.midprice}`);
  incomingData.push(`Ask Price : ${data.askprice}`);
  incomingData.push(`Ask Size : ${data.asksize}`);
  incomingData.push(`Last Price : ${data.lastprice}`);
  incomingData.push(`Last Size : ${data.lastsize}`);
  incomingData.push(`Halted : ${data.halted}`);
  incomingData.push(`After Hours : ${data.afterhours}`);
  incomingData.push(`Intermarket Seep Order (ISO) : ${data.ISO}`);
  incomingData.push(`Oddlot : ${data.oddlot}`);
  incomingData.push(`NMS Rule 611 : ${data.nmsRule}`);
  
  results.innerHTML = incomingData.join("<br>");
});
