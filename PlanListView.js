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
var DefaultGoals = [new Goal('国内旅行',3,'次',1),new Goal('做家务',10,'次',1),new Goal('骑行',100,'公里',1)];
var DefaultLogs = [new Log('五一桂林旅游',1,1),new Log('圣诞武汉游',1,1),new Log('扫地',1,2),new Log('周六清晨五缘湾骑行',15,3)];

function makeDataBlob () {
    var dataBlob = {};
    var sectionIDs = [];
    var rowIDs = [];

    var addEmptyRow = (index, planId) => {
	    var goal = new Goal('',0,'',0);
  		var rowId = 'P '+planId+',R '+goal.id;
        rowIDs[index].push(rowId);
        dataBlob[rowId] = goal;
	};

    for (var ii = 0; ii < DefaultPlans.length; ii++) {
    	var plan = DefaultPlans[ii];
    	var sectionId = 'Plan '+plan.id;
      	sectionIDs.push(sectionId);
      	dataBlob[sectionId] = plan;
      	rowIDs[ii] = [];
      	
      	if (plan.folded) {
      		addEmptyRow(ii,plan.id);
      	} else {
	      	var goals = DefaultGoals.filter(function (goal) { return goal.planId === plan.id; });
	      	// console.log('length of goals: '+goals.length+' planId: '+plan.id);
	      	if (goals.length === 0) {
	      		addEmptyRow(ii,plan.id);
	      	};
	      	for (var jj = 0; jj < goals.length; jj++) {
	      		var goal = goals[jj];
	      		var rowId = 'P '+plan.id+',R '+goal.id;
		        rowIDs[ii].push(rowId);
		        dataBlob[rowId] = goal;
	      	}
      	};
    }
    return [dataBlob,sectionIDs,rowIDs];
}

function formatDate (time,separator) {
    var date = new Date(time*1000);
    if (separator) {
    	return date.getFullYear()+separator+(date.getMonth()+1)+separator+date.getDate();
    } else {
    	return date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日';
    };
}

function logsByGoalId (goalId) {
	return DefaultLogs.filter(function (elog) { return elog.goalId === goalId; });
}

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

	    var results = makeDataBlob();
	    this.state = {
	      	dataSource: dataSource.cloneWithRowsAndSections(results[0],results[1],results[2]),
	      	dataBlob: results[0],
	      	sectionIDs: results[1],
	      	rowIDs: results[2],
	    };
	}

	renderSectionHeader(sectionData, sectionID) {
		console.log('renderSectionHeader '+sectionData.title);
      	if (sectionData.folded === true) {
			return (
				<TouchableOpacity onPress={() => {this._pressHeader(sectionData)}}>
					<View>
			    		<View style={styles.separator}/>	
			    		<View style={styles.section}>
			    			<Image source={require('./images/arrow-right.png')} style={styles.arrowRight} />
			      			<Text style={styles.planTitle}>{sectionData.title}</Text>
			      		</View>
		      		</View>
      			</TouchableOpacity>
	    	);
		} else {
	    	return (
	    		<TouchableOpacity onPress={() => {this._pressHeader(sectionData)}}>   
	    			<View>     	
			    		<View style={styles.separator}/>
			    		<View style={styles.section}>
			    			<Image source={require('./images/arrow-down.png')} style={styles.arrowDown} />
			    			<View style={styles.container}>
			      				<Text style={styles.planTitle}>{sectionData.title}</Text>
			    				<Text style={styles.goalDesc}>{formatDate(sectionData.startTime)+'-'+formatDate(sectionData.endTime)}</Text>
			    			</View>
			      			<View style={styles.rightMenuContainer}>
				      			<TouchableOpacity onPress={() => this._pressDelete(sectionData)}>
				      				<Text style={styles.rightMenu}>删除</Text>
				      			</TouchableOpacity>
				      			<TouchableOpacity onPress={() => this._pressAddGoal(sectionData)}>
				      				<Text style={styles.rightMenu}>添加</Text>
				      			</TouchableOpacity>
			      			</View>
			      		</View>
		      		</View>
      			</TouchableOpacity>
	    	);
		};
  	}

  	_pressHeader(sectionData) {
  		console.log('press header '+sectionData.folded);
  		sectionData.folded = !sectionData.folded;
  		var ds = this.state.dataSource;
  		var results = makeDataBlob();
	    this.setState({
	      	dataSource: ds.cloneWithRowsAndSections(results[0],results[1],results[2]),
	    });
  	}

  	_pressDelete(sectionData) {

  	}

  	_pressAddGoal(sectionData) {
  		
  	}

  	renderRow(rowData,sectionID,rowID) {
  		console.log('renderRow '+rowData.planId);
  		if (rowData.planId > 0) {
	    	return (
	    		<View style={styles.goalContainer}>
	    			<View style={{flex:1}}>
	      				<Text style={styles.goalDesc}>{rowData.desc+' '+rowData.total+' '+rowData.unit}</Text>
	    			</View>
	    			<View style={styles.goalContainer}>
	    				<Image source={require('./images/circle.png')} style={styles.goalButton} />
	    				<Image source={require('./images/edit.png')} style={styles.goalButton} />
	    			</View>
	      		</View>
	    	); 			
  		} else {
  			return (<View/>);
  		}
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
  		flex: 1,
	    flexDirection: 'row',
	    alignItems: 'center',
	    paddingHorizontal: 8,
	    paddingVertical: 8,
	    backgroundColor: '#f8f8f8',
	},
	arrowRight: {
	    width: 5,
	    height: 10,
	},
	arrowDown: {
	    width: 10,
	    height: 5,
	},
  	planTitle: {
  		flex: 1,
    	fontSize: 16,
    	color: '#000000',
    	paddingHorizontal: 8,
  	},
	planPeriod: {
		fontSize: 14,
    	color: '#000000',
    	paddingVertical: 5,
    	paddingLeft: 8,
	},
	goalContainer: {
		// flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
  	goalDesc: {
    	fontSize: 14,
    	color: '#000000',
    	paddingVertical: 8,
    	paddingLeft: 8,
  	},
  	goalButton: {
  		width: 32,
  		height: 32,
  		margin: 8,
  	},
  	logDesc: {
    	fontSize: 14,
    	color: '#b8b8b8',
  	},
  	separator: {
	    height: 1,
	    backgroundColor: '#ffffff',
	    marginLeft: 0,
  	},
  	container: {
  		flex: 1,
  	},
  	rightMenuContainer: {
  		flexDirection: 'row',
	    justifyContent: 'flex-end',
	    // backgroundColor: '#ff0000',
  	},
  	rightMenu: {
  		fontSize: 14,
  		color: '#8080d0',
	    paddingHorizontal: 8,
  	},
});