const express = require("express");

const router = require("./router.js");

const comet = require("./comet.js");

const body_parser = require("body-parser");

module.exports = ({puerto}) => {

        const app = express();

        app.use(body_parser.urlencoded({extended: true}));

        app.use("/api", router);

        app.use("/canal", comet);

        app.get("/test", function(req, res){
         
            res.json({ego: "test", version: "v1"});   
            
        })

        app.get("/la-query", function(req, res){
 
            res.json({
            
                a: req.query["a"],

                b: req.query["b"]
            
            })
        })

        const server = app.listen(puerto);

        return {

            app,

            cerrar(){

                server.close();

            }

        }

    }
