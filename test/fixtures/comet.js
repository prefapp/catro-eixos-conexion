const express = require("express");


const uuid = require("uuid/v4");

const conexiones = {

};

function ahora() { return Date.now() / 1000 | 0 }

class ManejadorCanal{

    constructor(req, res){

        this.uuid = uuid();

        this.req = req;

        this.res = res;

        this.heartbeatSegs = ahora();

        this.__id = 0;

        this.__h = false;
        this.__e = false;

        conexiones[this.uuid] = this;

    }

    iniciar(){

        this.__h = setInterval(() => {
            
            if(ahora() - this.heartbeatSegs >= 3){

                this.res.status(400);
                this.res.end();;

                this.terminar();
            }

        }, 100)

        this.__e = setInterval(() => {
            
            this.res.write(JSON.stringify({evento_id: this.__id++}))
            
        }, 100)

        this.res.write(JSON.stringify({uuid: this.uuid}));

        return this;

    }

    heartbeat(){

        this.heartbeatSegs = ahora();

        this.res.write(JSON.stringify({evento_id: "HEARTBEAT"}));
    }

    terminar(){
        
        clearInterval(this.__e);
        clearInterval(this.__h);

        delete conexiones[this.uuid];

    }

}

const r = express.Router();

r.post("/", function(req, res){
  
  new ManejadorCanal(req, res).iniciar();
    
})

r.get("/:id/heartbeat", function(req, res){
 
  if(!conexiones[req.params["id"]]){
    res.status(404);
    res.send("Not Found.");
  }
  else{

      conexiones[req.params["id"]].heartbeat();

  }
    
})

r.delete("/:id", function(req, res){
 
    if(conexiones[req.params]){

        conexiones[req.params["id"]].terminar();

        res.status(200);
        res.send("OK");
    }
    else{
        res.status(404);
        res.send("Not Found.");
    }
    
})

module.exports = r;
