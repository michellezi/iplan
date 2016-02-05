/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Component,
  Image,
  LayoutAnimation,
  ListView,
  Text,
  TouchableOpacity,
  View,
  AlertIOS,
} = React;

var shallowCompare=require('shallowCompare');
var Model = require('./Model.js');
var Utils = require('./Utils.js');
var DataManager = require('react-native').NativeModules.DataManager;
import CreateGoal from './CreateGoal.js';

//======================== Component ========================
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
      return r1.id === r2.id;
    };

    var sectionHeaderHasChanged = (s1,s2) => {
      return s1.id === s2.id;
    }

    var dataSource = new ListView.DataSource({
        getRowData: getRowData,
        getSectionHeaderData: getSectionData,
        rowHasChanged: rowHasChanged,
        sectionHeaderHasChanged: sectionHeaderHasChanged,
    });
    var results = [{},[],[]];
    this.state = {
        dataSource: dataSource.cloneWithRowsAndSections(results[0],results[1],results[2]),
    };
  }

  componentDidMount() {
    console.log('componentDidMount');
    this._resetDataSource();
    // Observe focus change events from the owner.
    this._listeners = [
      this.props.navigator.navigationContext.addListener('createPlan', this._resetDataSource.bind(this)),
      this.props.navigator.navigationContext.addListener('createGoal', this._resetDataSource.bind(this)),
    ];
  }

  renderSectionHeader(sectionData, sectionID) {
    // console.log('renderSectionHeader '+sectionData.title);
    if (sectionData.folded === 1) {
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
                <Text style={styles.goalDesc}>{Utils.formatDate(sectionData.startTime)+'-'+Utils.formatDate(sectionData.endTime)}</Text>
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

  renderRow(rowData,sectionID,rowID) {
    // console.log('renderRow '+rowData.planId+' '+rowData.id);
    if (rowData.id > 0) {
      var logComponents = [];
      var logs = rowData.logs;
      for (var i = 0; i < logs.length; i++) {
        if (logs[i].num < 0) {
          logComponents.push(<Text style={styles.logDesc}>{'撤销 '+logs[i].desc+' '+logs[i].num+' '+rowData.unit}</Text>);
        } else {
          logComponents.push(<Text style={styles.logDesc}>{logs[i].desc+' '+logs[i].num+' '+rowData.unit}</Text>);
        }
        
      };
      return (
        <View style={styles.goalContainer}>
          <View style={{flex:1}}>
              <Text style={styles.goalDesc}>{rowData.desc+' '+rowData.total+' '+rowData.unit}</Text>
              {logComponents}
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

  renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    // console.log('renderSeparator '+sectionID+"－"+rowID);
    return (<View style={styles.line}></View>);
  }

  render() {
    return (
      <ListView
        scrollRenderAheadDistance={50}
        initialListSize={10}
        style={styles.listview}
        dataSource={this.state.dataSource}
        onChangeVisibleRows={(visibleRows, changedRows) => console.log({visibleRows})}
        renderSectionHeader={this.renderSectionHeader.bind(this)}
        renderSeparator={this.renderSeparator.bind(this)}
        renderRow={this.renderRow.bind(this)}/>
        // renderHeader={this.renderHeader.bind(this)}/>
    );
  }

  _pressHeader(sectionData) {
    var sql = 'update Plan set folded='+(sectionData.folded===1?0:1)+' where id='+sectionData.id;
    // console.log('_pressHeader',sql);
    DataManager.executeWithSqlCommand(sql,(results)=>{
      if (results) {
        this._resetDataSource();
      };
    });
  }

  _pressDelete(sectionData) {
    AlertIOS.alert('删除计划 "'+sectionData.title+'"','',[{text: '确定',onPress:()=>{
      var sql = 'delete from Plan where id='+sectionData.id;
      DataManager.executeWithSqlCommand(sql,(results)=>{
        if (results) {
          this._resetDataSource();
        };
      });        
    }},{text: '取消'}]);
  }

  _pressAddGoal(sectionData) {
    this.props.navigator.push({
      component: CreateGoal,
      passProps: {planId:sectionData.id},
      navigationBarHidden: true,
    });
  }

  _resetDataSource() {
    DataManager.remakeDataBlob((results)=>{
      console.log('_resetDataSource',results);
      var ds = this.state.dataSource;
      this.setState({
        dataSource: ds.cloneWithRowsAndSections(results[0],results[1],results[2]),
      });
    });
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
    backgroundColor: '#fafafa',
  },        
  separator: {
    height: 1,
    backgroundColor: '#ffffff',
    marginLeft: 0,
  },
  line: {
    height: 0.5,
    backgroundColor: '#b8b8b8',
  },  
  //============ 图片的样式 ============
  arrowRight: {
    width: 5,
    height: 10,
  },
  arrowDown: {
    width: 10,
    height: 5,
  },
  goalButton: {
    width: 32,
    height: 32,
    margin: 8,
  },
  //============ 文本的样式 ============
  logDesc: {
    fontSize: 14,
    color: '#787878',
    paddingLeft: 16,
    paddingBottom: 5,
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
  rightMenu: {
    fontSize: 14,
    color: '#8080d0',
    paddingHorizontal: 8,
  },
  goalDesc: {
    fontSize: 14,
    color: '#000000',
    paddingVertical: 8,
    paddingLeft: 8,
  },
  //============ container的样式 ============
  rightMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // backgroundColor: '#ff0000',
  },
  goalContainer: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
});

