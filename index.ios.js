/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  NavigatorIOS,
  Component,
} = React;

var exps = require('./PlanListView.js');

class iPlan extends Component {
  _onRightButtonPress() {
    console.log('onRightButtonPress');
    this.refs['navigator'].push({
      title: '新建计划',
      component: exps.CreatePlan,
      // leftButtonIcon: require('./images/btn-back.png'),
      backButtonTitle: '取消',
      // onLeftButtonPress: () => this.refs['navigator'].pop(),
    });
  }

  render() {
    return (
      <NavigatorIOS
        ref='navigator'
        style={styles.container}
        initialRoute={{
          component: exps.PlanListView,
          title: '我的计划',
          rightButtonIcon: require('./images/btn-back.png'),
          passProps: { myProp: 'foo' },
          onRightButtonPress: this._onRightButtonPress.bind(this),
        }}/>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

AppRegistry.registerComponent('iPlan', () => iPlan);
