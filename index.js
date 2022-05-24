const express = require('express')
const app = express()
const route = require('./routes/router')

app.use(route)
app.listen(9000, () => console.log("Servidor do CEP OK !"))
