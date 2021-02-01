$(function(){

  //必須項目チェック
  $(".required").blur(function(){
    if($(this).val() == ""){
      $(this).siblings('div.component').children('span.error_required').text("※入力必須項目です");
      $(this).addClass("errored");
    } else {
      $(this).siblings('div.component').children('span.error_required').text("");
      $(this).removeClass("errored");
    }
  });

  //必須項目チェック（郵便番号）
  $(".required-postalcode").blur(function(){
    if($(this).val() == ""){
      $(this).parent().siblings('div.component').children('span.error_required').text("※入力必須項目です");
      $(this).addClass("errored");
    } else {
      $(this).parent().siblings('div.component').children('span.error_required').text("");
      $(this).removeClass("errored");
    }
  });

  //名字入力チェック
  $("#lastname").blur(function(){
    if(!$(this).val().match(/^[ぁ-んァ-ヶー一-龠 　rnt]+$/)){
      $(this).siblings('span.error_lastname').text("※正しく入力してください");
      $(this).addClass("errored");
    } else {
      $(this).siblings('span.error_lastname').text("");
      $(this).removeClass("errored");
    }
  });

  //名前入力チェック
  $("#firstname").blur(function(){
    if(!$(this).val().match(/^[ぁ-んァ-ヶー一-龠 　rnt]+$/)){
      $(this).siblings('span.error_firstname').text("※正しく入力してください");
      $(this).addClass("errored");
    } else {
      $(this).siblings('span.error_firstname').text("");
      $(this).removeClass("errored");
    }
  });

  //郵便番号（前）入力チェック
  $("#pre-postalcode").blur(function(){
    if(!$(this).val().match(/^[0-9]{3}$/)){
      $(this).parent().siblings('span.error_postalcode').text("※正しく入力してください");
      $(this).addClass("errored");
    } else {
      $(this).parent().siblings('span.error_postalcode').text("");
      $(this).removeClass("errored");
    }
  });

  //郵便番号（後）入力チェック
  $("#post-postalcode").blur(function(){
    if(!$(this).val().match(/^[0-9]{4}$/)){
      $(this).parent().siblings('span.error_postalcode').text("※正しく入力してください");
      $(this).addClass("errored");
    } else {
      $(this).parent().siblings('span.error_postalcode').text("");
      $(this).removeClass("errored");
    }
  });

  //電話番号入力チェック
  $("#telephone").blur(function(){
    if(!$(this).val().match(/^0\d{9,10}$/)){
      $(this).siblings('span.error_telephone').text("※正しく入力してください");
      $(this).addClass("errored");
    } else {
      $(this).siblings('span.error_telephone').text("");
      $(this).removeClass("errored");
    }
  });

  //メールアドレス入力チェック
  $("#email").blur(function(){
    if(!$(this).val().match(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)){
      $(this).siblings('span.error_email').text("※正しく入力してください");
      $(this).addClass("errored");
    } else {
      $(this).siblings('span.error_email').text("");
      $(this).removeClass("errored");
    }
  });

  //パスワード入力チェック
  $("#password").blur(function(){
    if(!$(this).val().match(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,100}$/)){
      $(this).siblings('span.error_password').text("※半角英小文字・大文字・数字をそれぞれ含む8文字以上100文字以下で入力してください");
      $(this).addClass("errored");
    } else {
      $(this).siblings('span.error_password').text("");
      $(this).removeClass("errored");
    }
  });

  //確認用パスワードチェック
  $("#conf-password").blur(function(){
    if(!$(this).val().match($("#password").val())){
      $(this).siblings('span.error_conf_password').text("パスワードと一致してません");
      $(this).addClass("errored");
    } else {
      $(this).siblings('span.error_conf_password').text("");
      $(this).removeClass("errored");
    }
  });

  //送信時の必須項目入力チェック
  $("#submit-input").on('click',function(){
    $(".required").each(function(){
      if($(this).val() == ""){
        $(this).siblings('div.component').children('span.error_required').text("※入力必須項目です");
        $(this).addClass("errored");
      }
    });
    $(".required-postalcode").each(function(){
      if($(this).val() == ""){
        $(this).parent().siblings('div.component').children('span.error_required').text("※入力必須項目です");
        $(this).addClass("errored");
      }
    });
    if($(".errored").length){
      return false;
    }
  });

});