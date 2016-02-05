'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Component,
  Text,
  View,
  DatePickerIOS,
} = React;

export default class DatePickerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: props.timestamp ? new Date(props.timestamp) : new Date (),
    }
  }

  _onDateChange(date) {
    this.setState({date: date});
    this.props.onDateChange && this.props.onDateChange(date);
  }

  _onPressCancel() {
    this.props.onCancel && this.props.onCancel();
  }

  _onPressOk() {
    this.props.onOk && this.props.onOk(this.state.date);
  }

  render() {
    return (
      <View>
        <View style={styles.container2}>
          <Text style={styles.toolBarText} onPress={this._onPressCancel.bind(this)}>
            {this.props.cancelTitle || '取消'}
          </Text>
          <View style={styles.container}/>
          <Text style={styles.toolBarText} onPress={this._onPressOk.bind(this)}>
            {this.props.okTitle || '确定'}
          </Text>
        </View>
        <DatePickerIOS
          date={this.state.date}
          minuteInterval={this.props.minuteInterval || 1}
          mode={this.props.mode || 'datetime'}
          onDateChange={this._onDateChange.bind(this)} />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container2: {
    // flex: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolBarText: {
    fontSize: 14,
    color: '#8080d0',
    paddingHorizontal: 8,
  },
});