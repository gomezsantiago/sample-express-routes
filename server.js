#! /usr/bin/env node

"use strict";

const fetch = require("node-fetch");
const {Observable} = require("rxjs/Observable");
const HTTP_PORT = 8039;

const socketIo = require("socket.io")(HTTP_PORT);

const endpoint = "https://api.iextrading.com/1.0";

var symbol = "fb";

const observable = Observable.create(observer => {
    try {
      setInterval(() => {
        fetch(`${endpoint}/tops?symbols=${symbol}`)
          .then(response => response.json())
          .then(response => {
            observer.next(response);
          });
      }, 1000);
    } catch (err) {
      observer.error(err);
    }
  });
  
  socketIo.on("connection", socket => {
      const {id} = socket;
      console.log(`sending data to client ${id}......`);
      socket.join(`room for${id}`);
      
      const subscription = observable.subscribe(iexData => {
          socketIo.to(`room for${id}`).emit("api-data", iexData);
      }, error => console.log("ERROR!!!",error));
    
      socket.on('clientRequestStock', (requestedSymbol)=>{
          symbol = requestedSymbol || symbol;
      });
    
      socket.on("disconnect", ()=>{
        socket.leave(`room for${id}`);
        subscription.unsubscribe();
    });

});