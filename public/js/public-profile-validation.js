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

  //名前入力チェック
  $("#name").blur(function(){
    if(!$(this).val().match(/^[a-zA-Z0-9ぁ-んァ-ヶー一-龠 　rnt]+$/)){
      $(this).siblings('span.error_name').text("※正しく入力してください");
      $(this).addClass("errored");
    } else {
      $(this).siblings('span.error_name').text("");
      $(this).removeClass("errored");
    }
  });

  //勤務先入力チェック
  $("#workplace").blur(function(){
    if(!$(this).val().match(/^[ぁ-んァ-ヶー一-龠 　rnt]+$/)){
      $(this).siblings('span.error_workplace').text("※正しく入力してください");
      $(this).addClass("errored");
    } else {
      $(this).siblings('span.error_workplace').text("");
      $(this).removeClass("errored");
    }
  });

  //実務年数入力チェック
  $("#business-experience").blur(function(){
    if(!$(this).val().match(/^[1-9]?[0-9]$/)){
      $(this).siblings('span.error_business_experience').text("※正しく入力してください");
      $(this).addClass("errored");
    } else {
      $(this).siblings('span.error_business_experience').text("");
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