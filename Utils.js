'use strict';

function formatDate (time,separator) {
  var date = time instanceof Date ? time : new Date(time*1000);
  if (separator) {
    return date.getFullYear()+separator+(date.getMonth()+1)+separator+date.getDate();
  } else {
    return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
  };
}

exports.formatDate = formatDate;