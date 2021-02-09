const mysql = require('mysql');

require('dotenv').config();

const dbConfig = {
  host     : 'localhost', //接続先ホスト
  user     : 'root',      //ユーザー名
  password : process.env.MYSQL_PASSWORD,          //パスワード
  database : 'matching_db'       //DB名
};

let connection;

function handleDisconnect() {
    console.log('create mysql connection');
    connection = mysql.createConnection(dbConfig); //接続する準備

    //接続
    connection.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); //2秒待ってから処理
        }
    });

    //error時の処理
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });

    module.exports = connection;
}

handleDisconnect();