#! /usr/bin/env node

"use strict";

var util = require("util");
var path = require("path");
var http = require("http");

const WEB_PATH = path.join(__dirname, "web");
const HTTP_PORT = 8039;

var express = require("express")
var expressApp = express();

var httpServer = http.createServer(expressApp);

main();

//**************************** */

function main(){
    defineRoutes(); 
    httpServer.listen(HTTP_PORT);
    console.log(`Listening on http://localhost:${HTTP_PORT}...`);
}


function defineRoutes(){
    //specifically for get requests
    expressApp.get("/get-records", async (request,response)=>{
        var records = await getAllRecords();
        response.writeHead(200, {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        });
        response.end(JSON.stringify(records));
    });

     //.use is more general than .get; it's used for all incoming requests
    //rewrite the url from the "friendly version" to the "real version": (ex: from something.com/about to something.com/about.html)
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
            let [,basename] = request.url.match(/^\/([\w\d]+)(?:[\/?#].*$)?$/);
            request.url = `${basename}.html`;
        }
        
        next();
    });
    
    //used whenever you have an outbound request and need to add custom headers
    const additionalConfigurations = {
        maxAge: 100,
        setHeaders: (response) => response.setHeader("Server", "Node Workshop: ex6")
    };

    const fileServer = express.static(WEB_PATH, additionalConfigurations)

    expressApp.use(fileServer);

    expressApp.get(/\.html$/, function custom404Error(request, response, next){
        request.url = "/404.html";
        fileServer(request,response,next);
    });


    // //HELPER
    // [
    //     {
    //         match: /^\/(?:index\/?)?(?:[?#].*$)?$/,
    //         serve: "index.html",
    //         force: true,
    //     },
    //     {
    //         match: /^\/js\/.+$/,
    //         serve: "<% absPath %>",
    //         force: true,
    //     },
    //     {
    //         match: /^\/(?:[\w\d]+)(?:[\/?#].*$)?$/,
    //         serve: function onMatch(params){
    //             return `${params.basename}.html`;
    //         }
    //     },
    //     {
    //         match: /[^]/,
    //         serve: "404.html"
    //     }
    // ]
}