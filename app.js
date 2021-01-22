const connection = require('./mysql');
const express = require('express')
const app = express()

app.set("view engine", "ejs")

app.use(express.static("public"))

app.get('/', (req, res) => {
    res.render('./index.ejs')
    connection.query('SELECT * FROM user;', function (err, rows, fields) {
        if (err) { console.log('err: ' + err); } 
        console.log(rows)
    })
})

app.listen(3000, () => {
    console.log('start')
})