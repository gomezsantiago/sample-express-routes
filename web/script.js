const socket = io("http://localhost:8039");

const results = document.querySelector(".socket-data");

socket.on("get-data", (data)=>{
  results.textContent = `counting seconds : ${data}`;
});
