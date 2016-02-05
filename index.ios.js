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

import CreatePlan from './CreatePlan.js'
import PlanListView from './PlanListView.js'

class iPlan extends Component {

  _onRightButtonPress() {
    this.refs['navigator'].push({
      component: CreatePlan,
      navigationBarHidden: true,
    });
  }

  componentWillReceiveProps (nextProps) {
    console.log('iPlan componentWillReceiveProps',nextProps.dataBlobs);
  }

  componentWillUpdateProps () {
    console.log('iPlan componentWillUpdateProps',this.props);
  }

  componentWillMount () {
    console.log('iPlan componentWillMount',this.props);
  }

  render() {
    return (
      <NavigatorIOS
        ref='navigator'
        style={styles.container}
        initialRoute={{
          component: PlanListView,
          title: '我的计划',
          rightButtonTitle: '新建',
          passProps: this.props,
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
