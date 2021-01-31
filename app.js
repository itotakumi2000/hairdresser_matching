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

app.post('/user-login', (req, res) => {
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

    connection.query('SELECT * FROM user_info WHERE mail =\'' + request_contents[0] +'\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};

      if(rows[0] !== undefined){
        if(bcrypt.compareSync(request_contents[1], rows[0].password)){
          //ログイン成功時
          res.render('./user/how-to-use.ejs')
        }else {
          //ログイン失敗時（パスワードが間違っているもの）
          res.render('./user/login.ejs')
        }
      }else {
        //ログイン失敗時（メールが未登録のもの）
        res.render('./user/login.ejs')
      }

    });
  })
})

app.post('/user-signup', (req, res) => {
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
    const saltRounds = 10;
    let hashed_password = bcrypt.hashSync(password, saltRounds);

    connection.query('insert into user_info(lastname, firstname, gender, postalcode, address, tel, mail, password) values (\'' + request_contents[0] + '\', \'' + request_contents[1] + '\', \''+ request_contents[2] + '\', \'' + request_contents[3] + request_contents[4] + '\', \'' + request_contents[5] + '\', \'' + request_contents[6] + '\', \'' + request_contents[7] + '\', \'' + hashed_password + '\');', function (err, rows) {
      if (err) { console.log('err: ' + err); } 
    });
  })
})

app.listen(3000, () => {
  console.log('start')
})