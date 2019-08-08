#! /usr/bin/env node

"use strict";

const path = require("path");
const http = require("http");
const express = require("express");
const expressApp = express();
const fetch = require("node-fetch");
const {Observable} = require("rxjs/Observable");

const httpServer = http.createServer(expressApp);
const socketIo = require("socket.io")(httpServer);

const WEB_PATH = path.join(__dirname, "web");
const HTTP_PORT = 8039;
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
      
      observable.subscribe(iexData => {
          socketIo.to(`room for${id}`).emit("api-data", iexData);
      }, error => console.log("ERROR!!!",error));
    
      socket.on('clientRequestStock', (requestedSymbol)=>{
          symbol = requestedSymbol || symbol;
      });
    
      socket.on("disconnect", ()=>{
        socket.leave(`room for${id}`);
    });

});


main();



//**************Function definitions************** */

function main(){
    defineRoutes(); 
    httpServer.listen(HTTP_PORT);
    console.log(`Listening on http://localhost:${HTTP_PORT}...`);
}

function defineRoutes(){

     //.use is more general than .get (which is specifically for get requests); it's used for all incoming requests
    /* rewrite the url from the "friendly version" to the "real version": (ex: from something.com/about to something.com/about.html)
        * request.url in this example would be "/about"*/
    expressApp.use((request, response, next)=>{
        /**essentially express will use these functions to resolve the request and if that function cannot fully resolve the request then it's handed down to the next function [top down order]*/
        
        if(/^\/(?:index\/?)?(?:[?#].*$)?$/.test(request.url)){
            request.url = '/index.html';
        }
        else if (/^\/js\/.+$/.test(request.url)){
            next();
            return;
        }
        else if(/^\/(?:[\w\d]+)(?:[\/?#].*$)?$/.test(request.url)){
            let [,basename] = request.url.match(/^\/([\w\d]+)(?:[\/?#].*$)?$/);  //ex: if request.url = /about this returns ["/about", "about"]
            request.url = `${basename}.html`;
        }
        
        next();
    });
    
    //used whenever you have an outbound request and need to add custom headers
    const additionalConfigurations = {
        maxAge: 100,
        setHeaders: (response) => response.setHeader("Server", "Sample-express-routes")
    };

    const fileServer = express.static(WEB_PATH, additionalConfigurations);

    expressApp.use(fileServer);

    expressApp.get(/\.html$/, function custom404Error(request, response, next){
        request.url = "/404.html";
        fileServer(request,response,next);
    });



    /***********
     * 
     * Regex rules:
     * /^A/             starts with A
     * /(?:x)/          matches x but doesn't remember the match
     *
     * 
     * 
     * 
     * 
     *
     *** example: specifically for get requests ***
     expressApp.get("/get-records", async (request,response)=>{
         const records = await getAllRecords();
         response.writeHead(200, {
             "Content-Type": "application/json",
             "Cache-Control": "no-cache"
         });
         response.end(JSON.stringify(records));
     });
     ************/
}