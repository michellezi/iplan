'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Component,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  AlertIOS,
  Image,
} = React;

var DataManager = require('react-native').NativeModules.DataManager;

export default class CreateGoal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			planId: props.planId,
			desc: '',
			total: 0,
			unit: '',
		}
	}

	_onBack() {
    this.props.navigator.pop();
  }

  _onSave() {
  	console.log('_onSave '+this.state.planId);
    var reg = /\S/;
    if (!reg.test(this.state.desc)) {
      AlertIOS.alert('请输入标题','',[{text: '好'}]);
      return;
    };
    if (this.state.total == 0) {
      AlertIOS.alert('请输入数量','',[{text: '好'}]);
      return;
    };
    if (this.state.unit == null) {
      AlertIOS.alert('请输入单位','',[{text: '好'}]);
      return;
    };
    var sql = "insert into Goal (desc, total, unit, planId) values('"+this.state.desc+"', "+this.state.total+", '"+this.state.unit+"', "+this.state.planId+")";
    DataManager.executeWithSqlCommand(sql,(results)=>{
    	console.log('executeWithSqlCommand result:'+results);
    	if (results) {
    		this.props.navigator.navigationContext.emit('createGoal');
    		this.props.navigator.pop();
    	};
    });   
  }

	render() {
    return (
      <View>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => this._onBack()}>
            <View style={styles.goalContainer}>
              <Image source={require('./images/btn-back.png')} style={styles.navBack} />
              <Text style={styles.navMenu}>取消</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.navTitle}>新建目标</Text>
          <TouchableOpacity onPress={() => this._onSave()}>
            <Text style={styles.navMenu}>保存</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.line}/>
        <View style={styles.navComponent}>
          <View style={styles.container2}>
            <Text style={styles.inputLabel}>描述</Text>
            <View style={styles.container}>
              <TextInput autoFocus={true}
                style={styles.textInput}
                returnKeyType="next"
                onChangeText={(text) => {
                  this.setState({desc:text});
                }}>
              </TextInput>
              <View style={styles.line}/>
            </View>
          </View>
          <View style={styles.container2}>
            <Text style={styles.inputLabel}>数量</Text>
            <View style={styles.container}>
              <TextInput style={styles.textInput}
              	returnKeyType="next"
              	keyboardType="numeric"
                onChangeText={(text) => {
                  this.setState({total:parseInt(text)});
                }}>
              </TextInput>
              <View style={styles.line}/>
            </View>
          </View>
          <View style={styles.container2}>
            <Text style={styles.inputLabel}>单位</Text>
            <View style={styles.container}>
              <TextInput style={styles.textInput}
                onChangeText={(text) => {
                  this.setState({unit:text});
                }}>
              </TextInput>
              <View style={styles.line}/>
            </View>
          </View>
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
  //============ 图片的样式 ============
  navBack: {
    width: 11,
    height: 21,
    marginLeft: 8,
  },
});