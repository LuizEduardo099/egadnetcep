//Rotas
const express = require('express')
const route = express.Router();
const axios = require('axios')

//Autenticação
const jwt = require('jsonwebtoken')
const SECRET = 'APPCEP'

//Geração de cache
const cache = require('node-cache');
const cacheGerado = new cache({ stdTTL: 300 }) // Pré set para 5 minutos em cache
var aux = 0

//Verificação do token
function verify(req, res, next){
    const token = req.headers['x-acess-token']
    jwt.verify(token, SECRET, (err, decoded) =>{
        if(err) return res.status(401).end()

        req.userId = decoded.userId
        next()
    })
}

//----------------------------//-------------------------------------------//
//Rotas '/'
route.get('/', (req, res) =>{
    res.json({message: "Autenticar em '/login' e colocar token em auth"})
})

route.post('/login', (req, res) =>{

    if(req.query.user === 'admin' && req.query.password == 'hv32'){
        const token = jwt.sign({userId: 1}, SECRET)
        return res.json({auth: true, token})
    }

    res.status(401).end()

})

route.post('/cep', verify, (req, res) => {
    
    let cep = req.query.value     
    let link = 'https://viacep.com.br/ws/' + cep + '/json/'

    axios.get(link).then(resp => {

        if(cacheGerado.has("cep") && aux == cep){

            console.log("Pegou do cache")
            return res.send(cacheGerado.get("cep"))

        }else{

            if(resp.data.erro == "true"){
                return res.json({message:"CEP não encontrado !"})
            }else{
                cacheGerado.set("cep", resp.data)
                console.log("Pegou da API")

                if(cep[5] == '-'){
                    aux = cep
                }else{
                    aux = resp.data.cep.replace('-', '')
                }
                
                return res.json(resp.data)
            }

        }
        

    }).catch((err) => {

        console.log("Erro: ", err)
        return res.json({message: "Erro de digitação"})

    });
       
})

module.exports = route
