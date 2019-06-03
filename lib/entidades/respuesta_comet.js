const Respuesta = require("./respuesta");

class RespuestaCommet extends Respuesta{

    constructor(opcs){

        super(opcs);

        this.inicial = opcs.inicial;
    }   

    get esMensajeInicial(){

        return this.inicial;

    }


}

module.exports = RespuestaCommet;
