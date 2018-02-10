import React from 'react';
import {
    ActivityIndicator,
    Image,
    View ,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar
} from 'react-native';
import {
    connect,
} from 'react-redux';
import {loadSession, wxLogIn, logOut} from '../../actions/user';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import { TabIconStyle } from "../../container/constants";
import Toast from 'react-native-root-toast';
import *as wechat from 'react-native-wechat';

const util = require('../../common/Util');
const images = {
    history: require('./selfImg/icon_history.png'),
    collection: require('./selfImg/icon_collection_file.png'),
    cache: require('./selfImg/icon_downloaded.png'),
    ticket: require('./selfImg/icon_ticket.png'),
    arrow:require('./selfImg/icon_next_arrow.png'),
}
class Self extends React.Component {
    static navigationOptions = {
        tabBarIcon: ({focused}) => {
            if (focused) {
                return <Image source={require('../imgs/my_sel.png')} style={TabIconStyle.tabIcon}/>
            }
            return <Image source={require('../imgs/my_unsel.png')} style={TabIconStyle.tabIcon}/>
        },
        tabBarLabel: '我的',
        headerTitle: '我的账户',
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
        this.state = {
            isLoading:false,
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.userData) {
            let userData = nextProps.userData;
            //之前的状态是未登录
            let notLogin = typeof this.props.userData === 'undefined' || typeof this.props.userData.login === 'undefined'
                || this.props.userData.login === false;
            if (notLogin && userData.login) {
                this._showMessage(nextProps);
            }
        }
    }

    _showMessage = (props) => {
        if (props.userData.authorizedKey) {
            this.setState({ isLoading: false });
            Toast.show('登录成功');
        } else if (props.userData.error) {
            Toast.show(props.userData.error.message);
        }
    };

    componentDidMount() {
        //StatusBar.setBackgroundColor('#9A89E4');
        if (!this.props.userData) {
            this.props.loadSession();
            try {
                wechat.registerApp('wx9df0c271a2b7df7c');
            } catch (e) {
                Toast.show(e);
            }

        }
    }

    componentWillUnmount() {
        //StatusBar.setBackgroundColor('#fff');
    }

    historyManage(){
        this.props.navigation.navigate('HistoryPage');
    }

    collectionManage() {
        this.props.navigation.navigate('CollectionPage');
    }
    // selfInfoManage() {
    //     this.props.navigation.navigate('SelfInfoPage', {userData:this.props.userData});
    // }

    spreadManage() {
        this.props.navigation.navigate('SpreadPage');
    }

    logIn() {
        let scope = 'snsapi_userinfo';
        let state = 'app:1512812889';
        //判断微信是否安装
        this.setState({ isLoading: true });
        wechat.isWXAppInstalled()
            .then((isInstalled) => {
                if (isInstalled) {
                    //发送授权请求
                    wechat.sendAuthRequest(scope, state)
                        .then(success => {
                            //console.log('code:', success.code);
                            this.props.wxLogIn(success.code, state)
                        })
                        .catch(err => {
                            Toast.show(err.code, err.errStr);
                            this.setState({ isLoading: false });
                        })
                } else {
                    Toast.show("没有安装微信");
                    this.setState({ isLoading: false });
                }
            })
    };
    loginOut() {
        this.props.logOut();
        Toast.show('您已退出登录');
    }


    render (){
        let loadingState = this.state.isLoading;
        let userData = this.props.userData;
        let showAvatar = userData && userData.avatar;
        let avatar = showAvatar ?
            <View>
                <Image
                    source={{uri: userData.avatar}}
                    style={styles.avatar}
                />
                <Text style={styles.nickname}>{userData.name} </Text>
            </View>
            :
            <View>
                <TouchableOpacity onPress={() => this.logIn()} disabled={loadingState}>
                    {loadingState ? <ActivityIndicator/> : null}
                    <Image
                        source={require('./selfImg/icon_login_wechat.png')}
                        style={styles.avatar}
                    />
                    <Text style={styles.nickname}>点 击 登 录 </Text>
                </TouchableOpacity>
            </View>
        let logoutButton = showAvatar ?
            <TouchableOpacity onPress={() =>this.loginOut()}>
                <View style={[styles.logOutDivider,styles.filedRow]}>
                    <Text style={styles.logOutText}>退出登录</Text>
                </View>
            </TouchableOpacity>
            :
            <TouchableOpacity disabled={true}>
                <View style={[styles.cannotLogOutDivider,styles.filedRow]}>
                    <Text style={styles.cannotLogOutText}>退出登录</Text>
                </View>
            </TouchableOpacity>
        return (
            <View style={{flex:1,backgroundColor: '#fff'}}>
                <View style= {styles.avatarContainer}>
                    {avatar}
                </View>
                <View style={styles.optionsContainer}>
                    <FieldItem itemText= '观看历史管理' itemIcon={images.history} onPress={() => this.historyManage()}/>
                    <FieldItem itemText= '收藏管理'  itemIcon={images.collection} onPress={() => this.collectionManage()}/>
                    <FieldItem itemText= '福利'  itemIcon={images.ticket} onPress={() => this.spreadManage()}/>
                    {logoutButton}
                </View>
            </View>
        )
    }
}

class FieldItem extends React.Component {
    static propTypes = {
        itemText: PropTypes.string.isRequired,
        itemIcon: PropTypes.number.isRequired,
        onPress: PropTypes.func.isRequired,
    };

    static defaultProps = {
        itemText: '观看历史',
        itemIconUrl: './selfImg/icon_history.png',
    };

    constructor(props) {
        super(props);
        StatusBar.setBackgroundColor('#fff');
    }

    onPress = () => {
        this.props.onPress();
    }

    render() {
        return (
            <TouchableOpacity onPress={() => this.onPress()}>
                <View style={[styles.divider,styles.filedRow,{justifyContent:'space-between'}]}>
                    <View style={{flexDirection:"row"}}>
                        <Image
                            source={this.props.itemIcon}
                            style={{ width: 20, height: 20 }}/>
                        <Text style={{paddingLeft:20,}}>{this.props.itemText}</Text>
                    </View>
                    <View style={{alignItems:'flex-end'}}>
                        <Image
                            source={images.arrow}
                            style={{ width: 7, height: 14 }}/>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
};

const mapStateToProps = (state, ownProps) => {
    let userSessionData = state.getIn(['user']);
    if (Immutable.Map.isMap(userSessionData)) {
        userSessionData = userSessionData.toJS();
    }

    return {
        ...ownProps,
        ...userSessionData,
    };
};

export default connect(mapStateToProps, {
    loadSession,
    wxLogIn,
    logOut
})(Self);

const styles = StyleSheet.create({
    avatarContainer: {
        width: util.SCREEN_WIDTH,
        height: 164,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionsContainer: {
        width: util.SCREEN_WIDTH,
        borderTopWidth:0.5,
        borderTopColor: '#d0d0d0',
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignSelf: 'center',
    },
    nickname: {
        paddingTop: 10,
        textAlign: 'center'
    },
    filedRow: {
        flexDirection: 'row',
        height:50,
        paddingTop: 15,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 5,
    },
    divider: {
        borderBottomColor: '#d0d0d0',
        borderBottomWidth: 0.5,
    },

    logOutDivider: {
        backgroundColor: 'red',
        justifyContent:'center'
    },
    logOutText: {
        color: '#fff'
    },

    cannotLogOutDivider: {
        backgroundColor: '#efefef',
        justifyContent:'center'
    },
    cannotLogOutText: {
        color: '#fff'
    },
});
