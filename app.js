const connection = require('./mysql');
const express = require('express')
const app = express()
const bcrypt = require('bcrypt');

app.set("view engine", "ejs")

app.use(express.static("public"))

connection.query('truncate table user_info;', function (err, rows, fields) {
    if (err) { console.log('err: ' + err); } 
});

app.get('/', (req, res) => {
    res.render('./common/index.ejs')
})

app.get('/user-login', (req, res) => {
    res.render('./user/login.ejs')
})

app.get('/user-signup', (req, res) => {
    res.render('./user/signup.ejs')
})

app.post('/user-post', (req, res) => {
    let data = '';

    req.on('data', function(chunk) {data += chunk})
        .on('end', function() {
    
        data = decodeURIComponent(data.replace(/\+/g, "%20"));
        data = data.split('&');

        let request_contents = [];
        data.forEach((value) => {
            let search_equal = value.indexOf("=")
            let request_content = value.substr(search_equal + 1)
            request_contents.push(request_content)
        })
        let password = request_contents[8];
        console.log('password：' + password)
        const saltRounds = 10;
        let hashed_password = bcrypt.hashSync(password, saltRounds);
        console.log('hashed_password：' + hashed_password)
        connection.query('insert into user_info(lastname, firstname, gender, postalcode, address, tel, mail, password) values (\' ' + request_contents[0] + '\', \' ' + request_contents[1] + '\', \''+ request_contents[2] + '\', \' ' + request_contents[3] + request_contents[4] + '\', \' ' + request_contents[5] + '\', \' ' + request_contents[6] + '\', \' ' + request_contents[7] + '\', \' ' + hashed_password + '\');', function (err, rows) {
            if (err) { console.log('err: ' + err); } 
        });
    })
})

app.listen(3000, () => {
    console.log('start')
})