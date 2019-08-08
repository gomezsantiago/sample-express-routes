#! /usr/bin/env node

"use strict";

const path = require("path");
const http = require("http");
const express = require("express")

const WEB_PATH = path.join(__dirname, "web");
const HTTP_PORT = 8039;

const expressApp = express();
const httpServer = http.createServer(expressApp);

const socketIo = require("socket.io")(httpServer);

var WebSocket = require('ws');
var ws = new WebSocket('wss://api.tiingo.com/iex');

var subscribe = {
    'eventName':'subscribe',
    'authorization':'fe78323407f6d763d3251dd034deec181009ab70',
    'eventData': {
        'thresholdLevel': 5
    }
}
ws.on('open', function open() {
    ws.send(JSON.stringify(subscribe));
});

socketIo.on("connection", socket => {
    const {id} = socket;
    console.log(`sending data to client ${id}......`);
    socket.join(`room for${id}`);

    // let counter = 0;
    // setInterval(()=>{
    //         counter = (counter+1)%61;
    //         socketIo.to(`room for${id}`).emit("get-data", counter);
    // }, 1000);
    
    ws.on('message', function(stockData) {
        const {data} = JSON.parse(stockData);
        const iexData = {};
        
        if(data) {
            iexData['date']  = data[1];
            iexData['nanoseconds'] = data[2];
            iexData['ticker'] = data[3];
            iexData['bidsize'] = data[4];
            iexData['bidprice'] = data[5];
            iexData['midprice'] = data[6];
            iexData['askprice'] = data[7];
            iexData['asksize'] = data[8];
            iexData['lastprice'] = data[9];
            iexData['lastsize'] = data[10];
            iexData['halted'] = data[11];
            iexData['afterhours'] = data[12];
            iexData['ISO'] = data[13];
            iexData['oddlot'] = data[14];
            iexData['nmsRule'] = data[15];
        } 

        socketIo.to(`room for${id}`).emit("get-data", iexData);
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