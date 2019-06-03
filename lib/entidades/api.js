/*
 * Abstracción de los extremos de una api
 * sencilla. 
 */

const ConexionBase = require("./base.js");

class Api{

    constructor(extremos = {}, args = {}){

        this.__iniciarExtremos(extremos);

        this.args = args;

        this.conexion = new ConexionBase(args);
    }

        __iniciarExtremos(extremos){

            Object.keys(extremos).forEach((e) => {
            
                this.__validarExtremo(extremos[e]);

                this[e] = (args = {}, opcs = {}) => {

                    return this.__tramitarPeticion(extremos[e], args, { ...opcs });
    
                }
            
            })

        }

        __validarExtremo(extremo){

            if(!extremo instanceof Object){

                throw `[catro-eixos-conexion][api]: extremo no es un objeto`;

            }

            //necesarios
            ["verbo", "url"].forEach((necesario) => {
                
                if(!extremo[necesario]){

                    throw `[catro-eixos-conexion][api]: extremo no tiene definido [${necesario}]`
                }
                
            })
        }

        __tramitarPeticion(extremo, args = {}, opcs = {}){

            return this.conexion.peticion({
            
                ...extremo,

                args: {

                    parametros: args,

                    eventos: {

                        despuesDePeticion: extremo.despuesDePeticion,

                        antesDePeticion: extremo.antesDePeticion

                    },

                    ...opcs,
                }
            
            })

        }


}

module.exports = Api;
