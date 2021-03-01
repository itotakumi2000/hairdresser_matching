$(function(){

  //----------------------------
  //         基本情報
  //----------------------------

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

  //----------------------------
  //     場所と金額の対応表
  //----------------------------

  $('#select-pref').blur(function () {
    let selected = $('#select-pref option:selected');
    if (!selected.val()) {
      $(this).siblings('div.component').children('span.error_required').text("※入力必須項目です");
      $(this).addClass("errored");
    } else {
      $(this).siblings('div.component').children('span.error_required').text("");
      $(this).removeClass("errored");
    }
  });

  $('#select-city').blur(function () {
    let selected = $('#select-city option:selected');
    if (!selected.val()) {
      $(this).siblings('div.component').children('span.error_required').text("※入力必須項目です");
      $(this).addClass("errored");
    } else {
      $(this).siblings('div.component').children('span.error_required').text("");
      $(this).removeClass("errored");
    }
  });


  $("#submit-pref-and-money").on('click',function(){
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

  //----------------------------
  //       スケジュール
  //----------------------------

  $('#select-next-hour').blur(function () {
    let select_prev_hour = $('#select-prev-hour option:selected').val();
    let select_prev_min = $('#select-prev-min option:selected').val();
    let select_prev = Number("1" + select_prev_hour + select_prev_min);
    let select_next_hour = $('#select-next-hour option:selected').val();
    let select_next_min = $('#select-next-min option:selected').val();
    let select_next = Number("1" + select_next_hour + select_next_min);
    if (select_next - select_prev <= 0) {
      $(this).parent().parent().siblings('div.component').children('span.error_required').text("※前の時刻よりも後の時刻を入力してください");
      $(this).addClass("errored");
    } else {
      $(this).parent().parent().siblings('div.component').children('span.error_required').text("");
      $(this).removeClass("errored");
    }
  });

  $('#select-next-min').blur(function () {
    let select_prev_hour = $('#select-prev-hour option:selected').val();
    let select_prev_min = $('#select-prev-min option:selected').val();
    let select_prev = Number("1" + select_prev_hour + select_prev_min);
    let select_next_hour = $('#select-next-hour option:selected').val();
    let select_next_min = $('#select-next-min option:selected').val();
    let select_next = Number("1" + select_next_hour + select_next_min);
    if (select_next - select_prev <= 0) {
      $(this).parent().parent().siblings('div.component').children('span.error_required').text("※前の時刻よりも後の時刻を入力してください");
      $(this).addClass("errored");
    } else {
      $(this).parent().parent().siblings('div.component').children('span.error_required').text("");
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
