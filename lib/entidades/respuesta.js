class Respuesta{

    constructor({r, body, args, error}){

        this.r = r;
        this.body = body;
        this.args = args;
        this.error = error || false;
    }

    get codigoRespuesta(){

        return this.r.statusCode;
    }

    get cuerpoString(){

        return this.body;
    }

    get respuestaErronea(){

        return this.error ? true : false;

    }

    get esJson(){

        return this.r.headers["content-type"].match(/application\/json/) !== null

    }

    get JSON(){

        return JSON.parse(this.body);

    }
}

module.exports = Respuesta;
