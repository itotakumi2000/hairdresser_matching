const connection = require('./mysql');
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const multer = require('multer');
const path = require('path');
const city_json = require('./public/js/pref_city');

require('dotenv').config();

app.set("view engine", "ejs")

app.use(cookieParser())
app.use(express.static("public"))

const upDir = path.join(__dirname, 'public/img/cosmetology_license');
const uploadDir = multer({dest: upDir});

const public_profile_img_upDir = path.join(__dirname, 'public/img/public_profile_img/');
const public_profile_img_uploadDir = multer({dest: public_profile_img_upDir});

function turnIntoHash(before_hash){
  const saltRounds = 10;
  let password = before_hash;
  let hashed_password = bcrypt.hashSync(password, saltRounds);
  return hashed_password;
}

app.get('/', (req, res) => {
  res.render('./common/index.ejs')
})

app.get('/user-login', (req, res) => {
  let cookie_value = req.cookies.user_value;
  if(cookie_value){
    let before_hash;
    let quotation_mark = cookie_value.indexOf('\'');
    cookie_value = cookie_value.substr(quotation_mark + 1, 60);
    connection.query('SELECT * FROM user_info WHERE hashed_email LIKE \'%' + cookie_value +'%\';', function (err, rows, fields) {
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

app.get('/pref-city', (req, res) => {
  res.json(require('./public/js/pref_city'))
})

app.get('/password-reset-form/:email', (req, res) => {
  let hashed_email = decodeURIComponent(req.params.email.replace(/\+/g, "%20"));

  connection.query('SELECT * FROM user_info WHERE hashed_email =\'' + hashed_email +'\';', function (err, rows, fields) {
    if (err) { console.log('err: ' + err)};

    if(rows.length !== 0){
      //ログイン成功時（メールが登録済みのもの）
      let error_msg = {empty_error_msg:'', inappropriate_error_msgs:[]};
      res.render('./user/password-reset-form.ejs', {error_msg:error_msg, entered_email:rows[0].email})
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
  let cookie_value = req.cookies.hairdresser_value;
  if(cookie_value){
    let before_hash;
    let quotation_mark = cookie_value.indexOf('\'');
    cookie_value = cookie_value.substr(quotation_mark + 1, 60);
    connection.query('SELECT * FROM hairdresser_info WHERE hashed_email =\'' + cookie_value +'\';', function (err, rows, fields) {
      if(rows.length !== 0){
        //cookie有、DB有
        before_hash = rows[0].email
        res.render('./hairdresser/how-to-use.ejs', {userName : before_hash})
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

app.get('/hairdresser-how-to-use', (req, res) => {
  res.render('./hairdresser/how-to-use')
})

app.get('/hairdresser-public-profile', (req, res) => {
  connection.query('SELECT * FROM hairdresser_info WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
    if (err) { console.log('err: ' + err)};
    let dresser_id =rows[0].id
    let public_profile_place_rows;
    let public_profile_schedule_rows;

    if(rows.length !== 0){
      connection.query('SELECT * FROM public_profile WHERE dresser_id=\'' + dresser_id + '\';', function (err, rows, fields) {
        if (err) { console.log('err: ' + err)};
        let public_profile_rows = rows;

        if(public_profile_rows.length !== 0){
          connection.query('SELECT * FROM public_profile LEFT OUTER JOIN public_profile_place ON public_profile.dresser_id = public_profile_place.dresser_id WHERE public_profile.dresser_id = \'' + dresser_id + '\';', function (err, place_rows, fields) {
            if (err) { console.log('err: ' + err)};
            public_profile_place_rows = place_rows;
          });
          connection.query('SELECT * FROM public_profile_schedule;', function (err, schedule_rows, fields) {
            if (err) { console.log('err: ' + err)};
            public_profile_schedule_rows = schedule_rows;
            res.render('./hairdresser/public-profile.ejs', {nickname: public_profile_place_rows[0].nickname, workplace: public_profile_place_rows[0].workplace, business_experience: public_profile_place_rows[0].business_experience, cut: public_profile_place_rows[0].cut, introduction: public_profile_place_rows[0].introduction, pref_and_money_rows: public_profile_place_rows, datetime: public_profile_schedule_rows})
          });
        } else {
          res.render('./hairdresser/public-profile.ejs', {nickname: "", workplace:"", business_experience: "", cut: "", introduction: "", pref_and_money_rows : "", datetime: ""})
        }

      });
    }else {
      console.log("cookie情報がありません")
    }
  });
})

app.get('/hairdresser-info', (req, res) => {
  res.render('./hairdresser/hairdresser-info')
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
          res.cookie('user_value', hashed_cookie, {
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

app.post('/password-reset-form', (req, res) => {
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
    if(request_contents[1].search(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,100}$/) === -1){
      error_msg.inappropriate_error_msgs.push({msg: "適切なパスワードを入力してください"})
    }
    if(request_contents[1] !== request_contents[2]){
      error_msg.inappropriate_error_msgs.push({msg: "パスワードが一致しておりません"})
    }

    if(error_msg.empty_error_msg !== '' || error_msg.inappropriate_error_msgs.length !== 0){
      res.render('./user/password-reset-form.ejs', {error_msg: error_msg, entered_email:request_contents[0]})
      return
    }

    let hashed_password = turnIntoHash(request_contents[1])

    connection.query('update user_info set password=\'' + hashed_password + '\' where email=\'' + request_contents[0] + '\';', function (err, rows) {
      if (err) { console.log('err: ' + err); }
    });

    connection.query('SELECT * FROM user_info WHERE email=\'' + request_contents[0] + '\';', function (err, rows) {
      if (err) { console.log('err: ' + err); }

      res.cookie('user_value', rows[0].hashed_email, {
        httpOnly: true,
        maxAge: 864000000
      })

      res.render('./user/how-to-use.ejs', {userName : rows[0].hashed_email})
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

    res.cookie('user_value', hashed_email, {
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
          res.cookie('hairdresser_value', hashed_cookie, {
            httpOnly: true,
            maxAge: 864000000
          })
          res.render('./hairdresser/how-to-use.ejs')
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

app.post('/hairdresser-signup', uploadDir.single('image_upload'), (req, res) => {
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

    connection.query('INSERT INTO hairdresser_info (lastname, firstname, gender, postalcode, address, tel, email, hashed_email, password) values (\'' + request_contents[0] + '\', \'' + request_contents[1] + '\', \''+ request_contents[2] + '\', \'' + request_contents[3] + request_contents[4] + '\', \'' + request_contents[5] + '\', \'' + request_contents[6] + '\', \'' + request_contents[7] + '\', \'' + hashed_email + '\', \'' + hashed_password + '\');', function (err, rows) {
      if (err) { console.log('err: ' + err); }
    });

    res.cookie('hairdresser_value', hashed_email, {
      httpOnly: true,
      maxAge: 864000000
    })

    res.render('./hairdresser/imgupload.ejs')
  })
})

app.post('/imgupload', uploadDir.single('upFile'), (req, res) => {
  connection.query('UPDATE hairdresser_info SET qualification=\'' + req.file.path + '\' WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
    if (err) { console.log('err: ' + err)};
  });

  res.render('./hairdresser/login-complete.ejs')
})

app.post('/public-profile-imgupload', public_profile_img_uploadDir.single('public-profile-imgupload-upFile'), (req, res) => {
  connection.query('SELECT * FROM hairdresser_info WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
    if (err) { console.log('err: ' + err)};
    let dresser_id =rows[0].id

    if(rows.length !== 0){
      connection.query('SELECT * FROM public_profile WHERE dresser_id=\'' + dresser_id + '\';', function (err, rows, fields) {
        if (err) { console.log('err: ' + err)};

        if(rows.length !== 0){
          connection.query('update public_profile set profile_img=\'' + req.file.path  + '\' where dresser_id=\'' + dresser_id  + '\';', function (err, rows, fields) {
            if (err) { console.log('err: ' + err)};
          });
        }else {
          connection.query('insert into public_profile(dresser_id, profile_img) values (\'' + dresser_id + '\', \'' + req.file.path + '\');', function (err, rows, fields) {
            if (err) { console.log('err: ' + err)};
          });
        }
      });
    }else {
      console.log("cookie情報がありませんよ")
    }
  });
})

app.post('/basic-info', (req, res) => {
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

    connection.query('SELECT * FROM hairdresser_info WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};
      let dresser_id =rows[0].id
      let public_profile_place_rows;
      let public_profile_schedule_rows;

      if(rows.length !== 0){
        connection.query('SELECT * FROM public_profile WHERE dresser_id=\'' + dresser_id + '\';', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};

          if(rows.length !== 0){
            connection.query('update public_profile set nickname=\'' + request_contents[0]  + '\', workplace=\'' + request_contents[1]  + '\', business_experience=\'' + request_contents[2]  + '\' where dresser_id=\'' + dresser_id  + '\';', function (err, rows, fields) {
              if (err) { console.log('err: ' + err)};
            });
          }else {
            connection.query('insert into public_profile(dresser_id, nickname, workplace, business_experience) values (\'' + dresser_id + '\', \'' + request_contents[0] + '\', \'' + request_contents[1] + '\', \'' + request_contents[2] + '\');', function (err, rows, fields) {
              if (err) { console.log('err: ' + err)};
            });
          }

          connection.query('SELECT * FROM public_profile LEFT OUTER JOIN public_profile_place ON public_profile.dresser_id = public_profile_place.dresser_id WHERE public_profile.dresser_id = \'' + dresser_id + '\';', function (err, place_rows, fields) {
            if (err) { console.log('err: ' + err)};
            public_profile_place_rows = place_rows;
          });
          connection.query('SELECT * FROM public_profile_schedule;', function (err, schedule_rows, fields) {
            if (err) { console.log('err: ' + err)};
            public_profile_schedule_rows = schedule_rows;
            res.render('./hairdresser/public-profile.ejs', {nickname: public_profile_place_rows[0].nickname, workplace: public_profile_place_rows[0].workplace, business_experience: public_profile_place_rows[0].business_experience, cut: public_profile_place_rows[0].cut, introduction: public_profile_place_rows[0].introduction, pref_and_money_rows: public_profile_place_rows, datetime: public_profile_schedule_rows})
          });

        });
      }else {
        console.log("cookie情報がありません")
      }
    });

  })
})

app.post('/cut-form',(req, res) => {
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

    connection.query('SELECT * FROM hairdresser_info WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};
      let dresser_id =rows[0].id
      let public_profile_place_rows;
      let public_profile_schedule_rows;

      if(rows.length !== 0){
        connection.query('SELECT * FROM public_profile WHERE dresser_id=\'' + dresser_id + '\';', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};

          if(rows.length !== 0){
            connection.query('update public_profile set cut=\'' + request_contents[0]  + '\' where dresser_id=\'' + dresser_id  + '\';', function (err, rows, fields) {
              if (err) { console.log('err: ' + err)};
            });
          }else {
            connection.query('insert into public_profile(dresser_id, cut) values (\'' + dresser_id + '\', \'' + request_contents[0] + '\');', function (err, rows, fields) {
              if (err) { console.log('err: ' + err)};
            });
          }

          connection.query('SELECT * FROM public_profile LEFT OUTER JOIN public_profile_place ON public_profile.dresser_id = public_profile_place.dresser_id WHERE public_profile.dresser_id = \'' + dresser_id + '\';', function (err, place_rows, fields) {
            if (err) { console.log('err: ' + err)};
            public_profile_place_rows = place_rows;
          });
          connection.query('SELECT * FROM public_profile_schedule;', function (err, schedule_rows, fields) {
            if (err) { console.log('err: ' + err)};
            public_profile_schedule_rows = schedule_rows;
            res.render('./hairdresser/public-profile.ejs', {nickname: public_profile_place_rows[0].nickname, workplace: public_profile_place_rows[0].workplace, business_experience: public_profile_place_rows[0].business_experience, cut: public_profile_place_rows[0].cut, introduction: public_profile_place_rows[0].introduction, pref_and_money_rows: public_profile_place_rows, datetime: public_profile_schedule_rows})
          });
        });
      }else {
        console.log("cookie情報がありません")
      }
    });

  })
})

app.post('/introduction-form',(req, res) => {
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

    connection.query('SELECT * FROM hairdresser_info WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};
      let dresser_id =rows[0].id
      let public_profile_place_rows;
      let public_profile_schedule_rows;

      if(rows.length !== 0){
        connection.query('SELECT * FROM public_profile WHERE dresser_id=\'' + dresser_id + '\';', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};

          if(rows.length !== 0){
            connection.query('update public_profile set introduction=\'' + request_contents[0]  + '\' where dresser_id=\'' + dresser_id  + '\';', function (err, rows, fields) {
              if (err) { console.log('err: ' + err)};
            });
          }else {
            connection.query('insert into public_profile(dresser_id, introduction) values (\'' + dresser_id + '\', \'' + request_contents[0] + '\');', function (err, rows, fields) {
              if (err) { console.log('err: ' + err)};
            });
          }
        });
        connection.query('SELECT * FROM public_profile LEFT OUTER JOIN public_profile_place ON public_profile.dresser_id = public_profile_place.dresser_id WHERE public_profile.dresser_id = \'' + dresser_id + '\';', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};

          public_profile_place_rows = rows;
        });
        connection.query('SELECT * FROM public_profile_schedule;', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};

          public_profile_schedule_rows = rows;
          res.render('./hairdresser/public-profile.ejs', {nickname: public_profile_place_rows[0].nickname, workplace: public_profile_place_rows[0].workplace, business_experience: public_profile_place_rows[0].business_experience, cut: public_profile_place_rows[0].cut, introduction: public_profile_place_rows[0].introduction, pref_and_money_rows: public_profile_place_rows, datetime: public_profile_schedule_rows})
        });
      }else {
        console.log("cookie情報がありません")
      }
    });

  })
})

app.post('/pref-and-money',(req, res) => {
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

    let json = JSON.parse(JSON.stringify(city_json))
    let selected_city = json[Number(request_contents[0])-1][request_contents[0]].city
    let selected_pref_name = json[Number(request_contents[0])-1][request_contents[0]].pref
    let selected_city_name;
    for(i = 0; i < selected_city.length; i++){
      if(selected_city[i].id === request_contents[1]){
        selected_city_name = selected_city[i].name
      }
    }

    connection.query('SELECT * FROM hairdresser_info WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};
      let dresser_id =rows[0].id
      let public_profile_place_rows;
      let public_profile_schedule_rows;

      if(rows.length !== 0){
        connection.query('insert into public_profile_place(dresser_id, pref, city, money) values (\'' + dresser_id + '\', \'' + selected_pref_name + '\', \'' + selected_city_name + '\', \'' + request_contents[2] + '\');', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
        });
        connection.query('SELECT * FROM public_profile LEFT OUTER JOIN public_profile_place ON public_profile.dresser_id = public_profile_place.dresser_id WHERE public_profile.dresser_id = \'' + dresser_id + '\';', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
          public_profile_place_rows = rows;
        });
        connection.query('SELECT * FROM public_profile_schedule;', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
          public_profile_schedule_rows = rows;
          res.render('./hairdresser/public-profile.ejs', {nickname: public_profile_place_rows[0].nickname, workplace: public_profile_place_rows[0].workplace, business_experience: public_profile_place_rows[0].business_experience, cut: public_profile_place_rows[0].cut, introduction: public_profile_place_rows[0].introduction, pref_and_money_rows: public_profile_place_rows, datetime: public_profile_schedule_rows})
        });
      }else {
        console.log("cookie情報がありません")
      }
    });

  })
})

app.post('/delete-pref-and-money',(req, res) => {
  let data = '';

  req.on('data', function(chunk) {data += chunk})
  .on('end', function() {

    data = decodeURIComponent(data.replace(/\+/g, "%20"));
    data = data.split('&');

    let request_contents = [];

    data.forEach((value) => {
      let search_equal = value.indexOf("=")
      let request_content = value.substr(search_equal + 1)
      request_content = Number(request_content)
      request_contents.push(request_content)
    })

    connection.query('SELECT * FROM hairdresser_info WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};
      let dresser_id =rows[0].id
      let public_profile_place_rows;
      let public_profile_schedule_rows;

      if(rows.length !== 0){
        connection.query('DELETE FROM public_profile_place WHERE id = \'' + request_contents[0] + '\';', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
        });
        connection.query('SELECT * FROM public_profile LEFT OUTER JOIN public_profile_place ON public_profile.dresser_id = public_profile_place.dresser_id WHERE public_profile.dresser_id = \'' + dresser_id + '\';', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
          public_profile_place_rows = rows;
        });
        connection.query('SELECT * FROM public_profile_schedule;', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
          public_profile_schedule_rows = rows;
          res.render('./hairdresser/public-profile.ejs', {nickname: public_profile_place_rows[0].nickname, workplace: public_profile_place_rows[0].workplace, business_experience: public_profile_place_rows[0].business_experience, cut: public_profile_place_rows[0].cut, introduction: public_profile_place_rows[0].introduction, pref_and_money_rows: public_profile_place_rows, datetime: public_profile_schedule_rows})
        });
      }else {
        console.log("cookie情報がありません")
      }
    });

  })
})

app.post('/schedule',(req, res) => {
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

    for(i=1; i<request_contents.length;i++){
      request_contents[i] = ("00" + request_contents[i]).slice(-2)
    }

    let prev_date = request_contents[0] + request_contents[1] + request_contents[2] + request_contents[3] + request_contents[4] + "00";
    let next_date = request_contents[0] + request_contents[1] + request_contents[2] + request_contents[5] + request_contents[6] + "00";

    connection.query('SELECT * FROM hairdresser_info WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};
      let dresser_id =rows[0].id
      let public_profile_place_rows;
      let public_profile_schedule_rows;

      if(rows.length !== 0){
        connection.query('insert into public_profile_schedule(dresser_id, datetime_before, datetime_after) values (\'' + dresser_id + '\', \'' + prev_date + '\', \'' + next_date + '\');', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
        });
        connection.query('SELECT * FROM public_profile LEFT OUTER JOIN public_profile_place ON public_profile.dresser_id = public_profile_place.dresser_id WHERE public_profile.dresser_id = \'' + dresser_id + '\';', function (err, place_rows, fields) {
          if (err) { console.log('err: ' + err)};
          public_profile_place_rows = place_rows;
        });
        connection.query('SELECT * FROM public_profile_schedule;', function (err, schedule_rows, fields) {
          if (err) { console.log('err: ' + err)};
          public_profile_schedule_rows = schedule_rows;
          res.render('./hairdresser/public-profile.ejs', {nickname: public_profile_place_rows[0].nickname, workplace: public_profile_place_rows[0].workplace, business_experience: public_profile_place_rows[0].business_experience, cut: public_profile_place_rows[0].cut, introduction: public_profile_place_rows[0].introduction, pref_and_money_rows: public_profile_place_rows, datetime: public_profile_schedule_rows})
        });
      }else {
        console.log("cookie情報がありません")
      }
    });

  })
})

app.post('/delete-schedule',(req, res) => {
  let data = '';

  req.on('data', function(chunk) {data += chunk})
  .on('end', function() {

    data = decodeURIComponent(data.replace(/\+/g, "%20"));
    data = data.split('&');

    let request_contents = [];

    data.forEach((value) => {
      let search_equal = value.indexOf("=")
      let request_content = value.substr(search_equal + 1)
      request_content = Number(request_content)
      request_contents.push(request_content)
    })

    connection.query('SELECT * FROM hairdresser_info WHERE hashed_email=\'' + req.cookies.hairdresser_value + '\';', function (err, rows, fields) {
      if (err) { console.log('err: ' + err)};
      let dresser_id =rows[0].id
      let public_profile_place_rows;
      let public_profile_schedule_rows;

      if(rows.length !== 0){
        connection.query('DELETE FROM public_profile_schedule WHERE id = \'' + request_contents[0] + '\';', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
        });
        connection.query('SELECT * FROM public_profile LEFT OUTER JOIN public_profile_place ON public_profile.dresser_id = public_profile_place.dresser_id WHERE public_profile.dresser_id = \'' + dresser_id + '\';', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
          public_profile_place_rows = rows;
        });
        connection.query('SELECT * FROM public_profile_schedule;', function (err, rows, fields) {
          if (err) { console.log('err: ' + err)};
          public_profile_schedule_rows = rows;
          res.render('./hairdresser/public-profile.ejs', {nickname: public_profile_place_rows[0].nickname, workplace: public_profile_place_rows[0].workplace, business_experience: public_profile_place_rows[0].business_experience, cut: public_profile_place_rows[0].cut, introduction: public_profile_place_rows[0].introduction, pref_and_money_rows: public_profile_place_rows, datetime: public_profile_schedule_rows})
        });
      }else {
        console.log("cookie情報がありません")
      }
    });

  })
})

app.listen(3000, () => {
  console.log('start')
})