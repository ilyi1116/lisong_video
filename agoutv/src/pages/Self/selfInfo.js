import React from 'react';
import {
    Image,
    View ,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import Toast from 'react-native-root-toast';
import {
    connect,
} from 'react-redux';
import Immutable from 'immutable';
import { TabIconStyle } from "../../container/constants";
import { logOut } from "../../actions/user";


class SelfInfo extends React.Component {
    static navigationOptions = {
        tabBarIcon: ({focused}) => {
            if (focused) {
                return <Image source={require('../imgs/my_sel.png')} style={TabIconStyle.tabIcon}/>
            }
            return <Image source={require('../imgs/my_unsel.png')} style={TabIconStyle.tabIcon}/>
        },
        tabBarLabel: '我的',
        headerTitle: '个人资料',
        headerStyle: {
            backgroundColor: '#fff',
            height: 44
        },
        headerTitleStyle: {
            color: '#052D60',
            fontSize: 18,
            alignSelf: 'center',
            fontWeight: 'bold',
        },
    };
    constructor (props){
        super(props);
    }

    loginOutFun = () => {
        this.props.logOut();
        this.props.navigation.navigate('LoginScreen');
        Toast.show('您已退出登录');
    }

    render (){
        let userData = this.props.navigation.state.params.userData;
        return (
            <View style={{flex:1, backgroundColor:'#fff'}}>
                <View style={[styles.divider,styles.filedRow,{justifyContent:'space-between'}]}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{paddingLeft:20}}>头像</Text>
                    </View>
                    <View style={{alignItems:'flex-end'}}>
                        <Image
                            source={{uri: userData.avatar}}
                            style={{ width: 30, height: 30, alignSelf: 'center' }}/>
                    </View>
                </View>
                <View style={[styles.divider,styles.filedRow,{justifyContent:'space-between'}]}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{paddingLeft:20,}}>昵称</Text>
                    </View>
                    <View style={{alignItems:'flex-end'}}>
                        <Text style={{paddingLeft:20,}}>{userData.name}</Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.divider,styles.filedRow,{justifyContent:'space-between'}]}
                                  onPress={this.loginOutFun}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{paddingLeft:20,}}>退出登录</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

}

const mapStateToProps = (state, ownProps) => {
    let userSessionData = state.getIn(['user', 'loginOut']);
    if (Immutable.Map.isMap(userSessionData)) {
        userSessionData = userSessionData.toJS();
    }

    return {
        ...ownProps,
        ...userSessionData,
    };
};

export default connect(mapStateToProps, {
    logOut
})(SelfInfo);

const styles = StyleSheet.create({
    filedRow: {
        flexDirection: 'row',
        height:50,
        paddingTop: 15,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 5,
    },
    divider: {
        borderBottomColor: '#efefef',
        borderBottomWidth: 1,
    },
    filedText: {
        color: '#404040',
        fontSize: 14,
        marginRight: 20,
        fontFamily:'PingFangSC_Regular'
    },
});
