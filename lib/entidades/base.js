/*
 * Base de todas las conexiones
 *
 */
const request = require("request");

const path = require("path");

const Respuesta = require("./respuesta.js");

const URL_PARAMETROS = new RegExp(/\:(\w+)/);

const debug = require("debug")("catro-eixos-conexion:peticion");

const VALIDAR_VERBO = function(verbo){

    return ["get", "post", "put", "patch", "delete"].filter(v === verbo)[0] ? true : false

}


function ESCAPAR_REGEXP(str){

   return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


class ConexionBase{

    static REQUEST(){

        return request;

    }

    get RESPUESTA_CLASE(){
        return Respuesta;
    }

    constructor({host, puerto, uri_base, protocolo, eventos = {}, headers = {}}, lookup = false){
        
        this.host = host;
        this.uri_base = uri_base || "/";
        this.protocolo = protocolo || "https";

        this.eventos = this.__inicializarEventos(eventos);

        this.puerto = puerto;

        this.headers = headers;
        
        this.lookup = lookup;

        if(!this.puerto)
            this.puerto = (this.protocolo === "https") ? "443" : "80";

    }

        __inicializarEventos({antesDePeticion = false, despuesDePeticion = false}){

            return {

                antesDePeticion,
                despuesDePeticion
            }

        }

    peticion({url, verbo, query, args = {}}){

        debug(`-------  Nueva peticion -------`);

        if(!VALIDAR_VERBO){
            this.error(`Verbo desconocido o inexistente: ${verbo}`);
        }

        url = this.formatearUrl({url, parametros: args.parametros});

        const opcs = {

            uri: url,

            headers: this.prepararCabeceras(args.headers || {}),

        }

        if(args.form)
            opcs.form = args.form;

        if(args.lookup || this.lookup){
            opcs.lookup = args.lookup || this.lookup;
        }


        /*
         * Preparacion de eventos
         */
        const antesDePeticion = (args.eventos && args.eventos.antesDePeticion) || this.eventos.antesDePeticion || false;
        const despuesDePeticion = (args.eventos && args.eventos.despuesDePeticion) || this.eventos.despuesDePeticion || false;

        debug(`haciendo ${verbo.toUpperCase()} a ${url}`)

        if(antesDePeticion){

            debug(`Ejecutando evento "antesDePeticion"`);

            antesDePeticion(opcs, args);
        }

        if( query ){

            query = this.formatearQuery(query, args.parametros)

            opcs.qs = query
        }


        return new Promise((cumplida, falla) => {
         
            request[verbo](opcs, (err, r, body) => {
                
                if(err){

                    return cumplida(new this.RESPUESTA_CLASE({
                    
                        error: err,

                        args: {
                            url, verbo, ...args
                        }
                    
                    }))

                }


                cumplida(
                
                    new this.RESPUESTA_CLASE({

                        r,

                        body,

                        peticion: {

                            url,

                            verbo,

                            ...args

                        }
                    
                    })        
                        
                )           
                
            })   
            
        }).then((r) => {
            
            let salida;

            if(despuesDePeticion){

                debug(`Ejecutando evento "despuesDePeticion"`)
             
                salida = despuesDePeticion(r);   
            }
            else{
                salida = r;
            }

            debug(`-------  Fin peticion -------`);

            return salida;
            
        })

    }

    error(err){

        throw `[catro-eixos-conexion][${this.constructor.name}]:${err}`
    }

    formatearUrl({
    
        url,
        uri_base = this.uri_base,
        protocolo = this.protocolo,
        host = this.host,
        puerto = this.puerto,
        parametros = {},
    
    }){



        const partes = uri_base.split(path.sep).concat(
        
            url.split(path.sep)        
        )

        let uri = partes.filter(p => p !== "").join("/")

        if(URL_PARAMETROS.test(uri)){

            uri = this.interpolarParametrosUrl(uri, parametros);
        }

        return `${protocolo}://${host}:${puerto}/${uri}`

    }

    interpolarParametrosUrl(url, parametros){

        let p;

        while(p = URL_PARAMETROS.exec(url)){

            const nombre_parametro = p[1];

            if(!parametros[nombre_parametro]){

                this.error(
                
                    `Para la url ${url} falta el parametro ${p[nombre_parametro]}`        
                );
            }

            const reg = new RegExp(ESCAPAR_REGEXP(`\:${nombre_parametro}`), "g");

            let valor = parametros[nombre_parametro];
    
            //escapamos los : si los hay
            if(valor.match(/\:/)){

                valor = valor.replace(/\:/g, "_--_");
            }

            url = url.replace(reg, valor);

        }

        url = url.replace(/_--_/g, ":");

        return url;
    }

    prepararCabeceras({auth = this.headers.auth}){

        const headers = { ...this.headers};

        if(auth && auth.basic){

            debug(`Agregando cabeceras de autenticacion basic`);

            headers["Authorization"] = this.__prepararAuthBasic(auth.basic);

            delete headers["auth"];
        }

        return headers;

    }

        __prepararAuthBasic({usuario, password}){

            return "Basic " + Buffer.from(`${usuario}:${password}`).toString("base64");

        }   

    formatearQuery(query, args = {}){

        const q = {}

        Object.keys(query).forEach((k) => {

            q[k] = args[k]

        })
        
        return q
    }

}



module.exports = ConexionBase;
