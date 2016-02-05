'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Component,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  DatePickerIOS,
  AlertIOS,
  Image,
} = React;

var DataManager = require('react-native').NativeModules.DataManager;
import DatePickerComponent from './DatePickerComponent.js';

export default class CreatePlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.title || '',
      startTime: props.startTime || 0,
      endTime: props.endTime || 0,
      startDate: props.startTime ? new Date(props.startTime) : null,
      endDate: props.endTime ? new Date(props.endTime) : null,
      choosingStart: false,
      choosingEnd: false,
    };
  }

  _pressStartText() {
    if (this.state.choosingStart || this.state.choosingEnd) {
      return;
    };
    this.setState({choosingStart:true});
  }

  _pressEndText() {
    if (this.state.choosingStart || this.state.choosingEnd) {
      return;
    };
    this.setState({choosingEnd:true});
  }

  _onDatePickerCancel() {
    this.setState({choosingStart:false,choosingEnd:false});
  }

  _onStartDatePickerOk(date) {
    this.setState({choosingStart:false,startDate:date});
  }

  _onEndDatePickerOk(date) {
    this.setState({choosingEnd:false,endDate:date});
  }

  _onBack() {
    this.props.navigator.pop();
  }

  _onSave() {
    var reg = /\S/;
    console.log('_onSave',reg.test(this.state.title))
    if (!reg.test(this.state.title)) {
      AlertIOS.alert('请输入标题','',[{text: '好'}]);
      return;
    };
    if (this.state.startDate == null) {
      AlertIOS.alert('请选择开始时间','',[{text: '好'}]);
      return;
    };
    if (this.state.endDate == null) {
      AlertIOS.alert('请选择结束时间','',[{text: '好'}]);
      return;
    };
    var sql = "insert into Plan (title, startTime, endTime) values('"+this.state.title+"', "+parseInt(this.state.startDate/1000)+", "+parseInt(this.state.endDate/1000)+")";
    console.log(sql);
    DataManager.executeWithSqlCommand(sql,(results)=>{
      console.log('executeWithSqlCommand result:'+results);
      if (results) {
        this.props.navigator.navigationContext.emit('createPlan');      
        this.props.navigator.pop();     
      };
    });
  }

  render() {
    var picker=(<View/>);
    if (this.state.choosingStart || this.state.choosingEnd) {
      picker=(
        <View style={styles.datePickerContainer}>
          <DatePickerComponent
              // date={this.state.choosingStart ? this.state.startDate : this.state.endDate}
            minuteInterval={1}
            mode={'datetime'}
            onCancel={this._onDatePickerCancel.bind(this)}
            onOk={this.state.choosingStart ? this._onStartDatePickerOk.bind(this) : this._onEndDatePickerOk.bind(this)} />
        </View>
      );
    };
    return (
      <View>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => this._onBack()}>
            <View style={styles.goalContainer}>
              <Image source={require('./images/btn-back.png')} style={styles.navBack} />
              <Text style={styles.navMenu}>取消</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.navTitle}>新建计划</Text>
          <TouchableOpacity onPress={() => this._onSave()}>
            <Text style={styles.navMenu}>保存</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.line}/>
        <View style={styles.navComponent}>
          <View style={styles.container2}>
            <Text style={styles.inputLabel}>标       题</Text>
            <View style={styles.container}>
              <TextInput autoFocus={true}
                style={styles.textInput}
                onChangeText={(text) => {
                  this.setState({title:text});
                }}>
              </TextInput>
              <View style={styles.line}/>
            </View>
          </View>
          <View style={styles.container2}>
            <Text style={styles.inputLabel}>开始时间</Text>
            <View style={styles.container}>
              <Text style={styles.goalDesc} onPress={this._pressStartText.bind(this)}>
                {this.state.startDate? (this.state.startDate.getFullYear()+'-'+(this.state.startDate.getMonth()+1)+'-'+this.state.startDate.getDate()+' '+this.state.startDate.getHours()+':'+this.state.startDate.getMinutes()): '请选择开始时间'}
              </Text>
              <View style={styles.line}/>
            </View>
          </View>
          <View style={styles.container2}>
            <Text style={styles.inputLabel}>结束时间</Text>
            <View style={styles.container}>
              <Text style={styles.goalDesc} onPress={this._pressEndText.bind(this)}>
                {this.state.endDate? (this.state.endDate.getFullYear()+'-'+(this.state.endDate.getMonth()+1)+'-'+this.state.endDate.getDate()+' '+this.state.endDate.getHours()+':'+this.state.endDate.getMinutes()): '请选择结束时间'}
              </Text>
              <View style={styles.line}/>
            </View>
          </View>
          {picker}
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  line: {
    height: 0.5,
    backgroundColor: '#b8b8b8',
  },
  //============ container的样式 ============
  datePickerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  navHeader: {
    height: 64,
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
  },
  goalContainer: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navComponent: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  container2: {
    // flex: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  //============ 文本的样式 ============
  navTitle: {
    fontSize: 17,
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  navMenu: {
    fontSize: 16,
    color: '#007aff',
    paddingHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    height: 46,
    paddingHorizontal: 4,
    // marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000000',
  },  
  goalDesc: {
    fontSize: 14,
    color: '#000000',
    paddingVertical: 8,
    paddingLeft: 8,
  },
  //============ 图片的样式 ============
  navBack: {
    width: 11,
    height: 21,
    marginLeft: 8,
  },
});