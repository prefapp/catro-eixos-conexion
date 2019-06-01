/*
 * Un cliente comet tiene que abrir una conexion
 * contra un servidor y esperar la recepción
 * de eventos a través del mismo
 */

const ConexionBase = require("./base.js");

class Comet extends ConexionBase{

    constructor({
    
        host,
        puerto,
        uri_base,
        protocolo
    
    }){

        super({host, puerto, uri_base, protocolo});

        this.__r = false;
    }

    abrirCanal({
    
        host = this.host,
        puerto = this.puerto,
        uri_base = this.uri_base,
        protocolo = this.protocolo,

        url,

        metodo,

        args,

        enRespuesta = () => {

        },
    
    }){

        return (async () => {
            
            await this.__aperturaCanal({
            
                host,
                puerto,
                uri_base,
                protocolo,
                url,
                metodo,
                args,

                enRespuesta
            
            })
            
        })()

    }

        __aperturaCanal({
        
            host,
            puerto,
            uri_base,
            protocolo,
            url,
            metodo,
            args,

            enRespuesta,
        
        }){

            const request = ConexionBase.REQUEST();

            this.__r = request[metodo]({
            
                uri: this.formatearUrl({
                    url,
                    host,
                    puerto,
                    uri_base,
                    protocolo,
                }),

                headers: this.prepararCabeceras(args),

                form: args.form,

            })                

            this.__r.on("response", (response) => {
          
                enRespuesta(

                    new this.RESPUESTA_CLASE({
                
                        r,
                        body: r.body,
                        url,
                        verbo,
                        ...args
                    })

                )
                
            })

            this.__r.on("data", () => {
                
                
            })
        }


}

module.exports = Comet;
