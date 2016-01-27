'use strict';
//========================数据类型 start========================
// 计划
var Plan = function (title?: string, startTime?: number, endTime?: number) {
  	this.title = title || '';
  	this.startTime = startTime || 0;
  	this.endTime = endTime || 0;

  	this.folded = true;

  	this.id = Plan.id++;
};

Plan.id = 1;

Plan.prototype.isEqual = function (plan) {
  	console.log('Plan.prototype.isEqual');
  	return (this.title === plan.title) && (this.startTime === plan.startTime) && (this.folded === plan.folded);
};

// 单个目标
var Goal = function (desc?: string, total?: number, unit?: string, planId?: number) {
	// 描述
	this.desc = desc || '';
	// 目标数量
	this.total = total || 0;
	// 目标单位
	this.unit = unit || '';
	// 所属计划
	this.planId = planId || 0;
	// 目前数量
	this.num = 0;

	this.id = Goal.id++;
}

Goal.id = 1;

var Log = function (desc?: string, num?: number, goalId?: number) {
	// 更新进度的描述，类似于备注的意思
	this.desc = desc || '';
	// 更新的时间
	this.time = parseInt(new Date().getTime()/1000); // 当前时间戳
	// 此次更新带来的增量
	this.num = num || 0;
	// 相关联的目标
	this.goalId = goalId || 0;

	this.id = Log.id++;
}

Log.id = 1;

//========================数据类型 end========================
var DefaultPlans = [new Plan('2016年度计划',1451577600,1483113600),new Plan('Plan 2',1451577600,1483113600)];
var DefaultGoals = [new Goal('国内旅行',3,'次',1),new Goal('做家务',10,'次',1),new Goal('骑行',100,'公里',1),new Goal('',0,'',2)];
var DefaultLogs = [new Log('五一桂林旅游',1,1),new Log('圣诞武汉游',1,1),new Log('扫地',1,2),new Log('周六清晨五缘湾骑行',15,3)];

import React, {
	Image,
	LayoutAnimation,
	ListView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Component,
} from 'react-native';

import NativeModules, {
	UIManager,
} from 'NativeModules'

class PlanHeader extends Component {
	constructor(props) {
		super(props);
		this.state = {plan: props.plan};
	}
  	componentWillMount () {
    	UIManager.setLayoutAnimationEnabledExperimental &&
      		UIManager.setLayoutAnimationEnabledExperimental(true);
  	}
  	_onPressHeader () {
    	this.state.plan.folded = !this.state.plan.folded;
    	this.setState({plan:this.state.plan}); //, needsUpdate:true
    	console.log('_onPressHeader '+this.state.plan.folded);
  	}
  	render () {
		var plan = this.state.plan;
		if (!plan) {
			return (<View></View>);
		};
      	if (plan.folded === true) {
			return (
				<TouchableOpacity onPress={this._onPressHeader.bind(this)}>
		    		<View style={styles.section}>
		    			<Image source={require('./images/arrow-right.png')} style={styles.arrowRight} />
		      			<Text style={styles.planTitle}>{plan.title}</Text>
		      		</View>
      			</TouchableOpacity>
	    	);
		} else {
	    	return (
	    		<TouchableOpacity onPress={this._onPressHeader.bind(this)}>        	
		    		<View style={styles.section}>
		    			<Image source={require('./images/arrow-down.png')} style={styles.arrowDown} />
		      			<Text style={styles.planTitle}>{plan.title}</Text>
		      		</View>
      			</TouchableOpacity>
	    	);
		};	    	
  	}
}

export default class PlanListView extends Component {
	constructor (props) {
		super(props);
		var getSectionData = (dataBlob, sectionID) => {
	      	return dataBlob[sectionID];
	    };
	    var getRowData = (dataBlob, sectionID, rowID) => {
	      	return dataBlob[rowID];
	    };

	    var rowHasChanged = (r1, r2) => {
			console.log('_rowHasChanged');
		    return r1.id === r2.id && r1.desc === r2.desc;
		};

		var sectionHeaderHasChanged = (s1,s2) => {
			console.log('_sectionHeaderHasChanged');
	  		return (s1.title === s2.title) && (s1.startTime === s2.startTime) && (s1.folded === s2.folded);
		}

	    var dataSource = new ListView.DataSource({
	      	getRowData: getRowData,
	      	getSectionHeaderData: getSectionData,
	      	rowHasChanged: rowHasChanged,
	      	sectionHeaderHasChanged: sectionHeaderHasChanged,
	    });

	    var dataBlob = {};
	    var sectionIDs = [];
	    var rowIDs = [];
	    for (var ii = 0; ii < DefaultPlans.length; ii++) {
	    	var plan = DefaultPlans[ii];
	    	var sectionId = 'Section '+ii;
	      	sectionIDs.push(sectionId);
	      	dataBlob[sectionId] = plan;
	      	rowIDs[ii] = [];
	      	
	      	var goals = DefaultGoals.filter(function (goal) { return goal.planId === plan.id; });
	      	for (var jj = 0; jj < goals.length; jj++) {
	      		var goal = goals[jj];
	      		var rowId = 'S '+ii+',R '+jj;
		        rowIDs[ii].push(rowId);
		        dataBlob[rowId] = goal;
	      	}
	    }
	    this.state = {
	      	dataSource: dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
	    };
	}

	renderSectionHeader(sectionData, sectionID) {
		console.log('renderSectionHeader '+sectionData.title);
		return (<PlanHeader plan={sectionData}/>);
  	}

  	_pressHeader(sectionData,sectionID) {
  		console.log('press header '+sectionData.folded);
  		sectionData.folded = !sectionData.folded;
  		var ds = this.state.dataSource;
  		this.setState({dataSource:ds.cloneWithRowsAndSections(ds._dataBlob,ds.sectionIdentities,ds.rowIdentities)});
  	}

  	renderRow(rowData,sectionID,rowID) {
  		console.log('renderRow '+rowData.desc);
    	return (
    		<View>
      			<Text style={styles.goalDesc}>{rowData.desc}</Text>
      		</View>
    	);
  	}

	render() {
		return (
	      	<ListView
	      		scrollRenderAheadDistance={50}
	      		initialListSize={10}
		        style={styles.listview}
		        dataSource={this.state.dataSource}
		        onChangeVisibleRows={(visibleRows, changedRows) => console.log({visibleRows, changedRows})}
		        renderSectionHeader={this.renderSectionHeader.bind(this)}
		        renderRow={this.renderRow.bind(this)}/>
    	);
	}

}

var styles = StyleSheet.create({
  	listview: {
    	backgroundColor: '#ffffff',
  	},
  	section: {
	    flexDirection: 'row',
	    alignItems: 'center',
	    padding: 8,
	},
	arrowRight: {
	    width: 5,
	    height: 10,
	},
	arrowDown: {
	    width: 10,
	    height: 5,
	},
  	planTitle : {
    	fontSize : 16,
    	color : '#000000',
    	padding : 8,
  	},
  	goalDesc : {
    	fontSize : 14,
    	color : '#000000',
  	},
  	logDesc : {
    	fontSize : 14,
    	color : '#b8b8b8',
  	},
  	separator: {
	    height: StyleSheet.hairlineWidth,
	    backgroundColor: '#bbbbbb',
	    marginLeft: 0,
  	},
});