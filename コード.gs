function myFunction() {
  
  // 朝会参加者のカレンダーIDとhipchatのメンション名を格納する配列
  var member = [];
  
  // 朝会メンバーが記載されているシートを取得
  var memberSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('朝会メンバー');
  var lastColumn = memberSheet.getLastColumn();
  var lastRow = memberSheet.getLastRow();
  
  // 朝会メンバーが記載されているシートから朝会参加者のカレンダーIDとhipchatのメンション名を取得し、memberへ格納する
  for(var i = 1; i <= lastRow; i++){
    var array = [memberSheet.getRange(i, 1).getValue(), memberSheet.getRange(i, 2).getValue()]
    member.push(array);
  }
  
  // hipchatの情報を記載しているシートからトークンとルームIDを取得
  var hipchatSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('hipchat');
  var authToken = hipchatSheet.getRange(1, 2).getValue();
  var roomId = hipchatSheet.getRange(2, 2).getValue();
  
  // 毎朝10時に朝会MTGの時間をセット
  var year = new Date().getFullYear();
  var month = new Date().getMonth();
  var day = new Date().getDate();
  var mtgTime = new Date(year, month, day, 10, 00);
  
  
  // 朝会メンバーの今日のカレンダーを取得して勤務時間の変更あり、かつ勤務時間が10時以降のメンバーをdelayMemberに格納
  var delayMember = [];
  for (var i = 0; i < member.length; i++) {
    var calendar = CalendarApp.getCalendarById(member[i][0]).getEventsForDay(new Date());
    var checkMember = member[i]
    for (var k = 0; k < calendar.length; k++)
      if (calendar[k].getTitle().match(/勤務時間/) && calendar[k].getStartTime() > mtgTime) {
        delayMember.push(checkMember);
      }
  }
  
  // delayMemberがいるときだけhipchatでお知らせ
  if (delayMember.length > 0) {
    
    // メンション作成
    var names = ""; 
    for (var i = 0; i < delayMember.length; i++) {
      var names = names + delayMember[i][1] + " ";
    }
    
    // hipchatに投稿するメッセージを作成
    var message = names + "\n おはようございます。本日の出勤予定は10時以降になっているようです。可能であれば朝会開始時刻までに本日のタスクのご報告をお願いいたします。";
    hipchat(authToken, roomId, message); // Development
  }

  // hipchatにメッセージを投稿する関数
  function hipchat(authToken, roomId, message) {
    var url = 'https://api.hipchat.com/v2/room/' + roomId + '/notification?auth_token=' + authToken;
    var payload =
        {
          color          : 'green',
          message        : message,
          notify         : true,
          message_format : 'text'
        };
    var params =
        {
          method       : 'post',
          contentType  : 'application/json; charset=utf-8',
          payload      : JSON.stringify(payload)
        };
    var res = UrlFetchApp.fetch(url, params);
  }
}