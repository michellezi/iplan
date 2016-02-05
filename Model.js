'use strict';

var DataManager = require('react-native').NativeModules.DataManager;

var createdTable = false;
function createTable () {
  if (createdTable) { return; };
  DataManager.executeWithSqlCommand("create table if not exists Plan (id integer primary key, title varchar(255), startTime integer, endTime integer, folded tinyint(1) NOT NULL DEFAULT ('0'))");
  DataManager.executeWithSqlCommand("create table if not exists Goal (id integer primary key, desc varchar(255), total integer, unit varchar(64), planId integer, num integer)");
  DataManager.executeWithSqlCommand("create table if not exists Log (id integer primary key, desc varchar(255), time integer, num integer, goalId integer)");
  createdTable = true;
}

//======================== 数据类型 ========================
// 计划
var Plan = function (obj:Object) {
  this.id = obj.id;
  this.title = obj.title || '';
  this.startTime = obj.startTime || 0;
  this.endTime = obj.endTime || 0;
  this.folded = obj.folded === 1;
};

// 单个目标
var Goal = function (obj:Object) {
  this.id = obj.id;
  // 描述
  this.desc = obj.desc || '';
  // 目标数量
  this.total = obj.total || 0;
  // 目标单位
  this.unit = obj.unit || '';
  // 所属计划
  this.planId = obj.planId || 0;
  // 目前数量
  this.num = obj.num || 0;
}

var Log = function (obj:Object) {
  this.id = obj.id;
  // 更新进度的描述，类似于备注的意思
  this.desc = obj.desc || '';
  // 更新的时间
  this.time = obj.time || parseInt(new Date().getTime()/1000); // 当前时间戳
  // 此次更新带来的增量
  this.num = obj.num || 0;
  // 相关联的目标
  this.goalId = obj.goalId || 0;
}

//======================== 数据及公共函数 ========================
var EmptyGoal = new Goal({'id':0});

function makeDataBlob (func) {
  var sql = 'select * from Plan limit 10';
  var results = DataManager.queryWithSqlCommand(sql);
  console.log('异步的返回');
  // DataManager.queryWithSqlCommand(sql,(results)=>{
    console.log('makeDataBlob callback,',results);
    var dataBlob = {};
    var sectionIDs = [];
    var rowIDs = [];

    var addEmptyRow = (index, planId) => {
      var rowId = 'P '+planId+',R '+EmptyGoal.id;
        rowIDs[index].push(rowId);
        dataBlob[rowId] = EmptyGoal;
    };

    for (var ii = 0; ii < results.length; ii++) {
      var plan = results[ii];
      var sectionId = 'Plan '+plan.id;
      sectionIDs.push(sectionId);
      dataBlob[sectionId] = plan;
      rowIDs[ii] = [];
      
      if (plan.folded) {
        addEmptyRow(ii,plan.id);
      } else {
        var sql2 = 'select * from Goal where planId='+plan.id;
        var goals = DataManager.queryWithSqlCommand(sql);
        // DataManager.queryWithSqlCommand(sql,(goals)=>{
          if (goals.length === 0) {
            addEmptyRow(ii,plan.id);
          };
          for (var jj = 0; jj < goals.length; jj++) {
            var goal = goals[jj];
            var rowId = 'P '+plan.id+',R '+goal.id;
            rowIDs[ii].push(rowId);
            dataBlob[rowId] = goal;
          };
        // });
      };
    };
    return [dataBlob,sectionIDs,rowIDs];
  // });
}

function logsByGoalId (goalId) {
  var sql = 'select * from Log where goalId='+goalId;
  return DataManager.queryWithSqlCommand(sql,(results)=>{
    return results;
  });
}

exports.createTable = createTable;
exports.Plan = Plan;
exports.Goal = Goal;
exports.Log = Log;
exports.makeDataBlob = makeDataBlob;
exports.logsByGoalId = logsByGoalId;