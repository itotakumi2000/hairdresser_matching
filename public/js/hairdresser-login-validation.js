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

  //送信時の必須項目入力チェック
  $("#submit-input").on('click',function(){
    $(".required").each(function(){
      if($(this).val() == ""){
        $(this).siblings('div.component').children('span.error_required').text("※入力必須項目です");
        $(this).addClass("errored");
      }
    });
    if($(".errored").length){
      return false;
    }
  });

});