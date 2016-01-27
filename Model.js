'use strict';

// 计划
var Plan = function () {
  this.name = '';
  this.startTime = 0;
  this.endTime = 0;

  this.folded = 0;

  this.id = Plan.id++;
};

Plan.id = 0;

// 单个目标
var Goal = function () {
	// 描述
	this.desc = '';
	// 目标数量
	this.total = 0;
	// 目标单位
	this.unit = '';
	// 所属计划
	this.planId = 0;
	// 目前数量
	this.num = 0;

	this.id = Goal.id++;
}

Goal.id = 0;

var Log = function () {
	// 更新进度的描述，类似于备注的意思
	this.detail = '';
	// 更新的时间
	this.time = 0;
	// 此次更新带来的增量
	this.num = 0;
	// 相关联的目标
	this.goalId = 0;

	this.id = Log.id++;
}

Log.id = 0;