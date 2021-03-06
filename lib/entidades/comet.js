/*
 * Un cliente comet tiene que abrir una conexion
 * contra un servidor y esperar la recepción
 * de eventos a través del mismo
 */

const ConexionBase = require("./base.js");

const RespuestaCommet = require("./respuesta_comet.js");

const debug = require("debug")("catro-eixos-conexion:commet");

class Comet extends ConexionBase{

    CLASE_RESPUESTA_COMET(){

        return RespuestaCommet;
    }

    constructor({
    
        host,
        puerto,
        uri_base,
        protocolo,
        headers
    
    }){

        super({host, puerto, uri_base, protocolo, headers});

        this.__r = false;

        this.__cerradoProgramado = false

        this.__cerradoControlado = false
    }

    cerrarCanal(){

        debug("Cerrando comet");

        if(this.__r){
            
            this.__cerradoProgramado = true;

            this.__r.abort();

        }
        else
            debug(`Intendo de cerrado de canal no abierto`)

    }

    abrirCanal(opcs = {}){

        opcs.host = opcs.host || this.host;
        opcs.puerto = opcs.puerto || this.puerto;
        opcs.protocolo = opcs.protocolo || this.protocolo;
        opcs.uri_base = opcs.uri_base || this.uri_base;

        opcs.enRespuesta = opcs.enRespuesta || function(){};
        opcs.enError = opcs.enError || function(){};

        return (async () => {
            
            await this.__aperturaCanal(opcs)
            
        })()

    }
        __aperturaCanal({
        
            host,
            puerto,
            uri_base,
            protocolo,
            url,
            verbo,
            args,
            headers,
            form,

            enRespuesta,

            enError
        
        }){

            const request = ConexionBase.REQUEST();

            const clase_respuesta_comet = this.CLASE_RESPUESTA_COMET();

            let inicial = true;

            const uri = this.formatearUrl({
               url,
               host,
               puerto,
               uri_base,
               protocolo,
            
            });

            debug(`Abriendo conexion comet a ${uri}`);

            this.__r = request[verbo]({
            
                uri,

                headers: this.prepararCabeceras(headers || this.headers),

                form: form,

            })                

            let R;

            this.__r.on("response", (response, body) => {
          
                R = response;
            })

            this.__r.on("data", (chunk) => {
                
                const datos = chunk.toString();

                enRespuesta(
                
                    new clase_respuesta_comet({
                    
                        r: R,
                        body: datos,
                        inicial,
                        url,
                        verbo,
                        ...args,
                    
                    })        
                        
                )

                inicial = false;
                
            })

            this.__r.on("error", (err) => {
             
                this.__cerradoControlado = true

                enError(
                
                    new this.RESPUESTA_CLASE({
                    
                        body: err,

                        error: "CONEXION_PERDIDA"
                    
                    })        
                        
                )   
                
            })

            this.__r.on("close", (r) => {
 
                this.__r.end();

                this.__r = null;

                if( this.__cerradoProgramado )
                    return

                if( this.__cerradoControlado )
                    return

                enError(
                
                    new this.RESPUESTA_CLASE({
                    
                        r,

                        body: "conexion cerrada",

                        error: "CONEXION_CERRADA"
                    
                    })        
                        
                )
                
            })
        }


}

module.exports = Comet;
