const {expect} = require("chai");

const {ConexionBase} = require("../index.js").entidades;

const server = require("./fixtures/server_json");

describe("Conexion base", function(){
    
    let ctl_server;

    before(function(next){
 
        this.timeout(0);

        ctl_server = server({puerto: 8888})

        next();
        
    })

    it("Permite realizar una peticion get", function(){
     
        this.timeout(0);

        return  new ConexionBase({
        
            host: "www.google.com",

        }).peticion({
        
            url: "/",

            verbo: "get"
        
        }).then((r) => {
 
            expect(r.respuestaErronea).to.equal(false);

            expect(r.codigoRespuesta).to.equal(200);   

            expect(r.cuerpoString).to.be.an("string");
            
        })
        
    })

    it("Controla una peticion get a un host inexistente", function(){
     
        this.timeout(0);

        return new ConexionBase({
        
            host: "asdfafiañ.es",
        
        }).peticion({
        
            url: "/",

            verbo: "get"
        
        }).then((r) => {
            
            expect(r.respuestaErronea).to.equal(true);   
            
        })
        
    })

    it("Controla peticiones de tipo json", function(){
     
        this.timeout(0);   

        return new ConexionBase({
        
            host: "localhost",

            protocolo: "http",

            puerto: "8888"
        
        }).peticion({
        
            url: "/test",

            verbo: "get"
        
        }).then((r) => {
         
            expect(r.respuestaErronea).to.equal(false);   
 
            expect(r.esJson).to.equal(true);       

            expect(r.JSON).to.be.an("object");

            expect(r.JSON.ego).to.equal("test");
        })
        
    })

    it("Controla una url con parametros interpolables", function(){
     
        this.timeout(0);   

        return new ConexionBase({
        
            host: "localhost",

            protocolo: "http",

            puerto: "8888"
        
        
        }).peticion({
        
            url: "/api/usuario/:id",

            verbo: "get",

            args: {
                
                parametros: {

                    id: "foo"

                }

            }
        
        }).then((r) => {
            
            expect(r.codigoRespuesta).to.equal(200);
            
        })
        
    })

    after(function(){
     
        ctl_server.cerrar();   
        
    })
    
})
