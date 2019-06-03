const {expect} = require("chai");

const {Api, Comet} = require("../index.js").entidades;

const server = require("./fixtures/server_json");

describe("Conexion comet", function(){
    
    let ctl_server;

    let api;

    let comet;

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

            "cerrar": {

                "url": "/:id",

                "verbo": "delete",

            }

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

            },

            uri_base: "/canal"
        
        });
        
    })

    it("Se puede abrir un canal y controlar su cerrado", function(next){
        
        this.timeout(0);

        comet = new Comet({
        
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
        
        })
        
        comet.abrirCanal({
        
            url: "/canal/",

            verbo: "post",

            enRespuesta(r){

            },

            enError(r){

                expect(r.respuestaErronea).to.equal(true);

                next();
            }
        
        })
        
    })

    it("Se puede controlar el canal comet y recibir eventos", function(next){

        this.timeout(0);

        let mensajes = [];

        let id_canal;

        comet.abrirCanal({
        
            url: "/canal",

            verbo: "post",

            enRespuesta(r){

                if(r.esMensajeInicial){

                    id_canal = r.JSON.uuid;

                    console.log(`con ${id_canal}`)

                    api.heartbeat({
                    
                        id: id_canal

                    }).then((r) => {
                     
                        expect(r.codigoRespuesta).to.equal(true);   

                    })
                        
                }
                else{

                    mensajes.push(r.body);

                }
            },

            enError(){

                console.log(mensajes)

                next();

            }
        
        })
        
    })

    after(function(){

        ctl_server.cerrar();   
        
        setTimeout(() => process.exit(0), 100)
    })
    
})
