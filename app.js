const connection = require('./mysql');
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

require('dotenv').config();

app.set("view engine", "ejs")

app.use(cookieParser())
app.use(express.static("public"))

function turnIntoHash(before_hash){
  const saltRounds = 10;
  let password = before_hash;
  let hashed_password = bcrypt.hashSync(password, saltRounds);
  return hashed_password;
}

connection.query('truncate table user_info;', function (err, rows, fields) {
  if (err) { console.log('err: ' + err); }
});

connection.query('truncate table hairdresser_info;', function (err, rows, fields) {
  if (err) { console.log('err: ' + err); }
});

app.get('/', (req, res) => {
  res.render('./common/index.ejs')
})

app.get('/user-login', (req, res) => {
  let cookie_value = req.cookies.value;
  if(cookie_value){
    let before_hash;
    let quotation_mark = cookie_value.indexOf('\'');
    cookie_value = cookie_value.substr(quotation_mark + 1, 60);
    connection.query('SELECT * FROM user_info WHERE hashed_email =\'' + cookie_value +'\';', function (err, rows, fields) {
      if(rows.length !== 0){
        //cookie有、DB有
        before_hash = rows[0].email
        res.render('./user/how-to-use.ejs', {userName : before_hash})
      }else {
        //cookie有、DB無
        res.render('./user/login.ejs', {error_msg:""})
      }
    });
  }else {
    //cookie無
    res.render('./user/login.ejs', {error_msg:""})
  }
})

app.get('/password-reset', (req, res) => {
  res.render('./user/password-reset.ejs', {error_msg:"", correct_msg:""})
})

app.get('/password-reset-form/:email', (req, res) => {
  let hashed_email = decodeURIComponent(req.params.email.replace(/\+/g, "%20"));

  connection.query('SELECT * FROM user_info WHERE hashed_email =\'' + hashed_email +'\';', function (err, rows, fields) {
    if (err) { console.log('err: ' + err)};

    if(rows.length !== 0){
      //ログイン成功時（メールが登録済みのもの）
      res.render('./common/index.ejs')
    }else {
      //ログイン失敗時（メールが未登録のもの）
      res.render('./user/password-reset.ejs', {error_msg:"エラー：無効なURLです", correct_msg:""})
    }
  });
})

app.get('/user-signup', (req, res) => {
  let error_msg = {empty_error_msg:'', inappropriate_error_msgs:[]};
  res.render('./user/signup.ejs', {error_msg: error_msg})
})

app.get('/hairdresser-top', (req, res) => {
  res.render('./hairdresser/hairdresser-top.ejs')
})

app.get('/hairdresser-login', (req, res) => {
  let cookie_value = req.cookies.value;
  if(cookie_value){
    let before_hash;
    let quotation_mark = cookie_value.indexOf('\'');
    cookie_value = cookie_value.substr(quotation_mark + 1, 60);
    connection.query('SELECT * FROM user_info WHERE hashed_email =\'' + cookie_value +'\';', function (err, rows, fields) {
      if(rows.length !== 0){
        //cookie有、DB有
        before_hash = rows[0].email
        res.render('./user/how-to-use.ejs', {userName : before_hash})
      }else {
        //cookie有、DB無
        res.render('./hairdresser/login.ejs', {error_msg:""})
      }
    });
  }else {
    //cookie無
    res.render('./hairdresser/login.ejs', {error_msg:""})
  }
})

app.get('/hairdresser-signup', (req, res) => {
  let error_msg = {empty_error_msg:'', inappropriate_error_msgs:[]};
  res.render('./hairdresser/signup.ejs', {error_msg: error_msg})
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

    connection.query('SELECT * FROM user_info WHERE email =\'' + request_contents[0] +'\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};

      if(rows.length !== 0){
        if(bcrypt.compareSync(request_contents[1], rows[0].password)){
          //ログイン成功時
          let hashed_cookie = turnIntoHash(request_contents[0])
          res.cookie('value', hashed_cookie, {
            httpOnly: true,
            maxAge: 864000000
          })
          res.render('./user/how-to-use.ejs', {userName : hashed_cookie})
        }else {
          //ログイン失敗時（パスワードが間違っているもの）
          res.render('./user/login.ejs', {error_msg:"エラー：パスワードが間違ってます"})
        }
      }else {
        //ログイン失敗時（メールが未登録のもの）
        res.render('./user/login.ejs', {error_msg:"エラー：メールが未登録です"})
      }

    });
  })
})

app.post('/password-reset', (req, res) => {
  let data = '';

  req.on('data', function(chunk) {data += chunk})
    .on('end', function() {

    data = decodeURIComponent(data.replace(/\+/g, "%20"));
    data = data.split('&');

    let search_equal = data[0].indexOf("=")
    let request_content = data[0].substr(search_equal + 1)

    connection.query('SELECT * FROM user_info WHERE email =\'' + request_content +'\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};

      if(rows.length !== 0){
        //ログイン成功時（メールが登録済のもの）
        const smtpConfig = nodemailer.createTransport({
          service: 'gmail',
          port: 46,
          secure: true,
          auth: {
              user: process.env.MAIL_ADDRESS,
              pass: process.env.MAIL_PASSWORD
          }
        });

        const message = {
          from: process.env.MAIL_ADDRESS,
          to: request_content,
          subject: 'テストです',
          text: 'パスワードを再設定するには以下のリンクをクリックしてください\n' + 'http://localhost:3000/password-reset-form/' + encodeURIComponent(rows[0].hashed_email)
        }

        smtpConfig.sendMail(message, (error, data) => {
          if(error){
            console.log(error)
          }
          console.log(data);
        });

        res.render('./user/password-reset.ejs', {error_msg:"", correct_msg:"メールを送信いたしましたのでご確認ください"})

      }else {
        //ログイン失敗時（メールが未登録のもの）
        res.render('./user/password-reset.ejs', {error_msg:"エラー：メールが未登録です", correct_msg:""})
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

    let error_msg = {empty_error_msg:'', inappropriate_error_msgs:[]};

    //未入力かどうかのバリデーション
    for(i = 0; i < request_contents.length; i++){
      if (request_contents[i] === "") {
        error_msg['empty_error_msg'] = "エラー：未入力の項目があります"
      }
    }

    //適切に入力されているかのバリデーション
    if(request_contents[0].search(/^[ぁ-んァ-ヶー一-龠 　rnt]+$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な名字を入力してください"})
    }
    if(request_contents[1].search(/^[ぁ-んァ-ヶー一-龠 　rnt]+$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な名前を入力してください"})
    }
    if(request_contents[3].search(/^[0-9]{3}$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な郵便番号を入力してください"})
    }
    if(request_contents[4].search(/^[0-9]{4}$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な郵便番号を入力してください"})
    }
    if(request_contents[6].search(/^0\d{9,10}$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な電話番号を入力してください"})
    }
    if(request_contents[7].search(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切なメールアドレスを入力してください"})
    }
    if(request_contents[8].search(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,100}$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切なパスワードを入力してください"})
    }
    if(request_contents[8] !== request_contents[9]){
      error_msg.inappropriate_error_msgs.push({msg: "パスワードが一致しておりません"})
    }

    if(error_msg.empty_error_msg !== '' || error_msg.inappropriate_error_msgs.length !== 0){
      res.render('./user/signup.ejs', {error_msg: error_msg})
      return
    }

    let hashed_email = turnIntoHash(request_contents[7])
    let hashed_password = turnIntoHash(request_contents[8])

    connection.query('insert into user_info(lastname, firstname, gender, postalcode, address, tel, email, hashed_email, password) values (\'' + request_contents[0] + '\', \'' + request_contents[1] + '\', \''+ request_contents[2] + '\', \'' + request_contents[3] + request_contents[4] + '\', \'' + request_contents[5] + '\', \'' + request_contents[6] + '\', \'' + request_contents[7] + '\', \'' + hashed_email + '\', \'' + hashed_password + '\');', function (err, rows) {
      if (err) { console.log('err: ' + err); }
    });

    res.cookie('value', hashed_email, {
      httpOnly: true,
      maxAge: 864000000
    })

    res.render('./user/how-to-use.ejs', {userName : hashed_email})
  })
})

app.post('/hairdresser-login', (req, res) => {
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

    connection.query('SELECT * FROM hairdresser_info WHERE email =\'' + request_contents[0] +'\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};

      if(rows.length !== 0){
        if(bcrypt.compareSync(request_contents[1], rows[0].password)){
          //ログイン成功時
          let hashed_cookie = turnIntoHash(request_contents[0])
          res.cookie('value', hashed_cookie, {
            httpOnly: true,
            maxAge: 864000000
          })
          res.render('./user/how-to-use.ejs', {userName : hashed_cookie})
        }else {
          //ログイン失敗時（パスワードが間違っているもの）
          res.render('./hairdresser/login.ejs', {error_msg:"エラー：パスワードが間違ってます"})
        }
      }else {
        //ログイン失敗時（メールが未登録のもの）
        res.render('./hairdresser/login.ejs', {error_msg:"エラー：メールが未登録です"})
      }

    });
  })
})

app.post('/hairdresser-signup', (req, res) => {
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

    let error_msg = {empty_error_msg:'', inappropriate_error_msgs:[]};

    //未入力かどうかのバリデーション
    for(i = 0; i < request_contents.length; i++){
      if (request_contents[i] === "") {
        error_msg['empty_error_msg'] = "エラー：未入力の項目があります"
      }
    }

    //適切に入力されているかのバリデーション
    if(request_contents[0].search(/^[ぁ-んァ-ヶー一-龠 　rnt]+$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な名字を入力してください"})
    }
    if(request_contents[1].search(/^[ぁ-んァ-ヶー一-龠 　rnt]+$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な名前を入力してください"})
    }
    if(request_contents[3].search(/^[0-9]{3}$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な郵便番号を入力してください"})
    }
    if(request_contents[4].search(/^[0-9]{4}$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な郵便番号を入力してください"})
    }
    if(request_contents[6].search(/^0\d{9,10}$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切な電話番号を入力してください"})
    }
    if(request_contents[7].search(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切なメールアドレスを入力してください"})
    }
    if(request_contents[8].search(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,100}$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切なパスワードを入力してください"})
    }
    if(request_contents[8] !== request_contents[9]){
      error_msg.inappropriate_error_msgs.push({msg: "パスワードが一致しておりません"})
    }

    if(error_msg.empty_error_msg !== '' || error_msg.inappropriate_error_msgs.length !== 0){
      res.render('./hairdresser/signup.ejs', {error_msg: error_msg})
      return
    }

    let hashed_email = turnIntoHash(request_contents[7])
    let hashed_password = turnIntoHash(request_contents[8])

    connection.query('insert into hairdresser_info(lastname, firstname, gender, postalcode, address, tel, email, hashed_email, password) values (\'' + request_contents[0] + '\', \'' + request_contents[1] + '\', \''+ request_contents[2] + '\', \'' + request_contents[3] + request_contents[4] + '\', \'' + request_contents[5] + '\', \'' + request_contents[6] + '\', \'' + request_contents[7] + '\', \'' + hashed_email + '\', \'' + hashed_password + '\');', function (err, rows) {
      if (err) { console.log('err: ' + err); }
    });

    res.cookie('value', hashed_email, {
      httpOnly: true,
      maxAge: 864000000
    })

    res.render('./user/how-to-use.ejs', {userName : hashed_email})
  })
})

app.listen(3000, () => {
  console.log('start')
})