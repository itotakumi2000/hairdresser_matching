$(function() {
  $.getJSON('./pref_city.json', function(data) {
    for(let i=0; i<47; i++) {
      let code = i+1;
      code = ('00'+code).slice(-2); // ゼロパディング
      $('#select-pref').append('<option value="'+code+'">'+data[i][code].pref+'</option>');
    }
  });
});

// 都道府県メニューに連動した市区町村フォーム生成
$('#select-pref').on('change', function() {
  $('#select-city option:nth-child(n+2)').remove(); // ※1 市区町村フォームクリア
    let select_pref = ('00'+$('#select-pref option:selected').val()).slice(-2);
    let key = Number(select_pref)-1;
    $.getJSON('./pref_city.json', function(data) {
      for(let i=0; i<data[key][select_pref].city.length; i++){
        $('#select-city').append('<option value="'+data[key][select_pref].city[i].id+'">'+data[key][select_pref].city[i].name+'</option>');
      }
  });
});