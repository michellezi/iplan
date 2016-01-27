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


// var iPlan = React.createClass({
//   render: function() {
//     return (
//       <Navigator
//         initialRoute={{ name: 'MainView', component: MainView }}
//         configureScene={() => {
//           return Navigator.SceneConfigs.VerticalDownSwipeJump;
//         }}
//         renderScene={(route, navigator) => {
//           let Component = route.component;
//           if(route.component) {
//             return <Component {...route.params} navigator={navigator} />
//           }
//         }} />
//       );
//   }
// });

import PlanListView from './PlanListView.js';

class iPlan extends Component {
  render() {
    return (
      <NavigatorIOS
        style={styles.container}
        initialRoute={{
          component: PlanListView,
          title: 'My View Title',
          passProps: { myProp: 'foo' },
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
