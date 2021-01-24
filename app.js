const connection = require('./mysql');
const express = require('express')
const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))

app.get('/', (req, res) => {
    res.render('./common/index.ejs')
})

app.get('/login', (req, res) => {
    res.render('./common/index.ejs')
})

app.get('/signup', (req, res) => {
    res.render('./common/index.ejs')
})

app.listen(3000, () => {
    console.log('start')
})