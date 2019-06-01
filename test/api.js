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

    it("Se puede configurar una api", function(){
     
        this.timeout(0);   

        api = new Api({
        
            "test": {

                verbo: "get",

                url: "/test"

            },

            "usuario": {

                verbo: "get",

                url: "/api/usuario/:id"

            },

            "usuarioCrear": {

                verbo: "post",

                url: "/api/usuario",

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

            }
        
        });
        
    })

    it("La api configurada es usable", function(){
        
        return api.test().then((r) => {
            
            expect(r.respuestaErronea).to.equal(false);

            expect(r.esJson).to.equal(true);

            expect(r.JSON.ego).to.equal("test");
            
        })   
        
    })

    it("La api se puede usar con parametros en la url", function(){
     
        return api.usuario({id: "foo"}).then((r) => {
            
            expect(r.respuestaErronea).to.equal(false);

            expect(r.esJson).to.equal(true);

            expect(r.JSON.nombre).to.equal("Lol");
            
        })   
        
    })

    it("Se puede enviar un formulario y pasar auth", function(){
    
        this.timeout(0);

        return api.usuarioCrear({}, {
        
            form: {id: "foo2", nombre: "Pedro"}
        
        }).then((r) => {

            expect(r.respuestaErronea).to.equal(false);

            expect(r.codigoRespuesta).to.equal(200);

            return api.usuario({id: "foo2"})

        }).then((r) => {
            
            expect(r.respuestaErronea).to.equal(false);

            expect(r.codigoRespuesta).to.equal(200);
            
        })
    })

    after(function(){
     
        ctl_server.cerrar();   
        
    })
    
})
