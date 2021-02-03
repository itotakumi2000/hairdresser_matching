const connection = require('./mysql');
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const bcrypt = require('bcrypt');

app.set("view engine", "ejs")

app.use(cookieParser())
app.use(express.static("public"))

function turnIntoHash(before_hash){
  let password = before_hash;
  const saltRounds = 10;
  let hashed_password = bcrypt.hashSync(password, saltRounds);
  return hashed_password;
}

connection.query('truncate table user_info;', function (err, rows, fields) {
  if (err) { console.log('err: ' + err); } 
});

app.get('/', (req, res) => {
  res.render('./common/index.ejs')
})

app.get('/user-login', (req, res) => {
  let cookie_value = req.cookies.value;
  if(cookie_value){
    let quotation_mark = cookie_value.indexOf('\'');
    cookie_value = cookie_value.substr(quotation_mark + 1, 60);
    let before_hash;
    connection.query('SELECT * FROM user_info;', function (err, rows, fields) {
      for(i = 0; i < rows.length; i++){
        if(bcrypt.compareSync(rows[i].mail, cookie_value)){
          before_hash = rows[i].mail
        }
      }
      if(before_hash){
        res.render('./user/how-to-use.ejs', {userName : before_hash})
      }else {
        res.render('./user/login.ejs', {error_msg:""})
      }
    });
  }else {
    res.render('./user/login.ejs', {error_msg:""})
  }
})

app.get('/user-signup', (req, res) => {
  let error_msg = {empty_error_msg:'', inappropriate_error_msgs:[]};
  res.render('./user/signup.ejs', {error_msg: error_msg})
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

    let hashed_password = turnIntoHash(request_contents[8])

    connection.query('insert into user_info(lastname, firstname, gender, postalcode, address, tel, mail, password) values (\'' + request_contents[0] + '\', \'' + request_contents[1] + '\', \''+ request_contents[2] + '\', \'' + request_contents[3] + request_contents[4] + '\', \'' + request_contents[5] + '\', \'' + request_contents[6] + '\', \'' + request_contents[7] + '\', \'' + hashed_password + '\');', function (err, rows) {
      if (err) { console.log('err: ' + err); } 
    });

    let hashed_cookie = turnIntoHash(request_contents[7])

    res.cookie('value', hashed_cookie, {
      httpOnly: true,
      maxAge: 864000000
    })

    res.render('./user/how-to-use.ejs', {userName : hashed_cookie})
  })
})

app.listen(3000, () => {
  console.log('start')
})