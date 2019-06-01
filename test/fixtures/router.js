const express = require("express");

const r = express.Router();

const usuario = "mi-usuario";
const password = "mi-secreto";

const mockups = {

    usuarios: {

        "foo": {

             id: "foo",

             nombre: "Lol",

             perfil: {

                 preferencias: {
                 
                     panel: "lite"
                 }

             }

        }

    }

}

r.use(function(req, res, next){

    if(req.method === "POST"){

        //comprobamos auth
        let auth = (req.headers["authorization"] || "");

        auth = auth.split(/Basic\s+/)[1];

        if(!auth){
            res.status(403);
            res.send("Unauthorized");
            return;
        }

        let p = Buffer.from(auth, "base64").toString("ascii").split(/\:/)

        if(p[0] === usuario && p[1] === password ){

            return next();
        }
        else{

            res.status(403);
            res.send("Unauthorized");
            return;

        }
    }
 
    next();   
})

r.get("/usuario/:id", function(req, res){
 
    if(!mockups.usuarios[req.params.id]){

        res.status(404);
        res.send("Not found.");

        return;
    }

    return res.json(
    
        mockups.usuarios[req.params.id]
    
    );
    
})

r.post("/usuario", function(req, res){
    
    mockups.usuarios[req.body.id] = req.body;

    res.status(200);
    res.send("OK");
})

module.exports = r;
