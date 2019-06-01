const {expect} = require("chai");

const {Api} = require("../index.js").entidades;

const server = require("./fixtures/server_json");

describe("Conexion base", function(){
    
    let ctl_server;

    let api;

    before(function(next){
 
        this.timeout(0);

        ctl_server = server({puerto: 8888})

        next();
        
    })

    it("Se configura una api para canal", function(){
     
        this.timeout(0);   

        api = new Api({
        
            "heartbeat": {

                url: "/:id/heartbeat",

                verbo: "get"

            },

        }, {
        
            host: "localhost",

            puerto: "8888",

            protocolo: "http",

            headers: {

                auth: {

                    basic: {

                        usuario: "mi-usuario",

                        password: "mi-secreto"

                    }
                }

            }
        
        });
        
    })

    it("Se puede abrir un canal", function(next){
        
        next();
        
    })

    after(function(){
     
        ctl_server.cerrar();   
        
    })
    
})
