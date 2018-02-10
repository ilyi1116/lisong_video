'use strict';


import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Share,
    Clipboard,
    StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Toast from 'react-native-root-toast';
import LinearGradient from 'react-native-linear-gradient';
import XingrenLink from '../../components/XingrenLink';
import XingrenButton from '../../components/XingrenButton';
import XingrenLoading from '../../components/XingrenLoading';
import XingrenInputModal from '../../components/XingrenInputModal';

import { loadDevice, bindInvite, switchAccount } from "../../actions/spread";

const util = require('../../common/Util');

class SpreadScreen extends React.Component {
    static navigationOptions = {
        header: null,
        tabBarVisible: false,
    };

    static propTypes = {
        timeUpdated: PropTypes.number,
        isLoading: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this._icModal = null;
        this._acModal = null;
    }

    componentDidMount() {
        StatusBar.setBackgroundColor('#9A89E4');
        this.props.loadDevice();

        let {params} = this.props.navigation.state;
        if (!util.isEmptyObject(params) && typeof params['code'] === 'string') {
            this._exchagne(params['code']);
        }
    }
    componentWillUnmount() {
        StatusBar.setBackgroundColor('#fff');
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.device && nextProps.device) {
            if (this.props.device.totalInvites != nextProps.device.totalInvites) {
                let totalInvites = parseInt(nextProps.device.totalInvites);
                if (!isNaN(totalInvites)) {
                    launchSettings.spi.merge({totalInvites,});
                }
            }

            if (this._diffProps(this.props.device.bind, nextProps.device.bind)) {
                Toast.show(nextProps.device.bind.message);
                this._icModal.close();
            }

            if (this._diffProps(this.props.device.switch, nextProps.device.switch)) {
                Toast.show(nextProps.device.switch.message);
                this._acModal.close();
            }
        }

        let thisParams = this.props.navigation.state.params;
        let nextParams = nextProps.navigation.state.params;
        if (nextParams) {
            if ((util.isEmptyObject(thisParams) || typeof thisParams['code'] === 'undefined') || thisParams['code'] !== nextParams['code']) {
                this._exchagne(nextParams['code']);
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.device.timeUpdated !== this.props.device.timeUpdated
            || nextProps.device.isLoading !== this.props.device.isLoading
            || this._diffProps(this.props.device.bind, nextProps.device.bind) === true
            || this._diffProps(this.props.device.switch, nextProps.device.switch) === true;
    }

    getAccountCode() {
        return launchSettings.spi.instanceCode.toUpperCase();
    }

    getInviteLink() {
        return launchSettings.inviteDomain.replace('%(code)s', launchSettings.spi.uniqueId)
            .replace('%(channel)s', global.launchSettings.channelID);
    }

    _diffProps(thisProps, nextProps) {
        return (typeof thisProps === 'undefined' && nextProps) || (thisProps && nextProps && thisProps.timeUpdated < nextProps.timeUpdated);
    }

    _switch() {
        this._acModal && this._acModal.show();
    }

    _switchSubmit(code) {
        if (code) {
            this._acModal.busy();
            this.props.switchAccount(code);
        } else {
            Toast.show('请输入有效的账户编码');
        }
    }

    _exchagne(code) {
        if (typeof code !== 'string') {
            code = '';
        }

        this._icModal && this._icModal.show(code);
    }

    _exchangeSubmit(code) {
        if (code) {
            this._icModal.busy();
            this.props.bindInvite(code);
        } else {
            Toast.show('请输入有效的兑换码');
        }
    }

    _refresh() {
        this.props.loadDevice();
    }

    _copyCode() {
        Clipboard.setString(this.getAccountCode());
        Toast.show('账户编码已复制');
    }

    _copyLink() {
        Clipboard.setString(this.getInviteLink());
        Toast.show('链接已复制');
    }

    _shareLink() {
        Share.share({
            message: this.getInviteLink(),
        }, {
            dialogTitle: '分享推广链接',
        }).then((result) => {
            if (result.action === Share.dismissedAction) {
                Toast.show('取消分享');
            }
        }).catch((error) => {
            console.log('Share Error', error);
        });
    }
    _onBackward = () => {
        this.props.navigation.goBack();
    }

    render() {
        let showDetail = typeof launchSettings.spi !== 'undefined';
        return (
            <LinearGradient colors={['#9A89E4', '#90E3ED']} style={styles.container}>
                {showDetail &&
                <View>
                    <View style={styles.topButtonContainer}>
                        <TouchableOpacity style={styles.topButton} onPress={this._onBackward}>
                            <Image
                                source={require('../imgs/icon_back_arrow_white.png')}
                                style={styles.backButton}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this._exchagne.bind(this)}>
                            <View style={styles.topButton}>
                                <Text style={styles.exchangeButtonText}>兑换</Text>
                            </View>
                        </TouchableOpacity>
                    </View>


                    <View style={styles.topButtonContainer}>
                        <TouchableOpacity onPress={this._exchagne.bind(this)}>
                            <View style={styles.topButton}>
                                <Text style={styles.exchangeButtonText}></Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this._refresh.bind(this)}>
                            <View style={styles.topButton}>
                                <Text style={styles.refreshButtonText}>刷新</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.remainsContainer}>
                        <Text style={styles.remainsTitle}>观影券</Text>
                        <Text style={styles.remainsValue}>{launchSettings.spi.remainsPlay}</Text>
                        {launchSettings.spi.isInfiniteInvalid ? <Text
                            style={styles.remainsExpire}>到期时间：{launchSettings.spi.infiniteExpireText}</Text> : null}
                    </View>
                    <View style={styles.rowContainer}>
                        <View style={[styles.cellContainer, styles.cellButtonGroup]}>
                            <View style={styles.cellText}>
                                <Text style={styles.cellTitle}>账户编号</Text>
                                <Text style={styles.cellValue} numberOfLines={1}>{this.getAccountCode()}</Text>
                            </View>
                            <View style={styles.cellButtonBar}>
                                <XingrenLink text={"切换"} style={styles.cellButton} textStyle={styles.cellButtonText}
                                             onPress={this._switch.bind(this)}/>
                                <XingrenLink text={"复制"} style={styles.cellButton} textStyle={styles.cellButtonText}
                                             onPress={this._copyCode.bind(this)}/>
                            </View>
                        </View>
                    </View>
                    <ScrollView>
                        {/*<View style={styles.rowContainer}>*/}
                        {/*<View style={styles.cellContainer}>*/}
                        {/*<Text style={styles.cellTitle}>今日任务</Text>*/}
                        {/*<Text style={styles.cellValue}>点击广告今日看片儿数 +3</Text>*/}
                        {/*</View>*/}
                        {/*</View>*/}
                        <View style={[styles.rowContainer, styles.columnContainer]}>
                            <Text
                                style={styles.remainsTitle}>推广任务（永久增加每日看片数，当前每次看片数为{launchSettings.spi.playOfDay}）</Text>
                            <View style={[styles.cellContainer, styles.taskRow]}>
                                <Text style={[styles.taskText, styles.textImportant]}>- 兑换福利码 -</Text>
                                <Text style={[styles.taskText, {width: 100}, styles.textImportant]}>+2, 无限 48 小时</Text>
                                <Text
                                    style={[styles.taskText, styles.textImportant]}>({launchSettings.spi.inviteInstanceId > 0 ? 1 : 0}/1)</Text>
                            </View>
                            <View style={[styles.cellContainer, styles.taskRow]}>
                                <Text style={styles.taskText}>成功推广 1 人</Text>
                                <Text style={[styles.taskText, {width: 100}]}>+2</Text>
                                <Text style={styles.taskText}>({Math.min(1, launchSettings.spi.totalInvites)}/1)</Text>
                            </View>
                            <View style={[styles.cellContainer, styles.taskRow]}>
                                <Text style={styles.taskText}>成功推广 2 人</Text>
                                <Text style={[styles.taskText, {width: 100}]}>+4</Text>
                                <Text style={styles.taskText}>({Math.min(2, launchSettings.spi.totalInvites)}/2)</Text>
                            </View>
                            <View style={[styles.cellContainer, styles.taskRow]}>
                                <Text style={styles.taskText}>成功推广 3 人</Text>
                                <Text style={[styles.taskText, {width: 100}]}>+20</Text>
                                <Text style={styles.taskText}>({Math.min(3, launchSettings.spi.totalInvites)}/3)</Text>
                            </View>
                            <View style={[styles.cellContainer, styles.taskRow]}>
                                <Text style={styles.taskText}>成功推广 10 人</Text>
                                <Text style={[styles.taskText, {width: 100}]}>无限</Text>
                                <Text
                                    style={styles.taskText}>({Math.min(10, launchSettings.spi.totalInvites)}/10)</Text>
                            </View>
                            <View style={[styles.cellContainer, styles.taskRow]}>
                                <Text style={styles.taskText}>成功推广 100 人</Text>
                                <Text style={[styles.taskText, {width: 100}]}>无限，无广告</Text>
                                <Text
                                    style={styles.taskText}>({Math.min(100, launchSettings.spi.totalInvites)}/100)</Text>
                            </View>
                        </View>
                        <View style={styles.bottomButtonContainer}>
                            <XingrenButton text={"分享推广链接"} style={styles.bottomButton}
                                           textStyle={styles.bottomButtonText} onPress={this._shareLink.bind(this)}/>
                            <Text style={styles.orText}>OR</Text>
                            <XingrenButton text={"复制推广链接"} style={styles.bottomButton}
                                           textStyle={styles.bottomButtonText} onPress={this._copyLink.bind(this)}/>
                        </View>
                    </ScrollView>
                    <XingrenLoading visible={this.props.device.isLoading}/>
                    <XingrenInputModal
                        ref={(ref) => this._icModal = ref}
                        title={"请输入兑换码"}
                        placeholder={"兑换码"}
                        onSubmit={this._exchangeSubmit.bind(this)}/>
                    <XingrenInputModal ref={(ref) => this._acModal = ref} title={"请输入要切换账户编码"}
                                       onSubmit={this._switchSubmit.bind(this)}/>
                </View>
                }
            </LinearGradient>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['spread', 'device']);
    return {
        ...ownProps,
        device: util.toJS(data),
    };
};

export default connect(mapStateToProps, {
    loadDevice,
    bindInvite,
    switchAccount,
})(SpreadScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabIcon: {
        width: 31,
        height: 28,
    },
    topButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingLeft: 16,
        paddingRight: 16,
    },
    topButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exchangeButtonText: {
        fontSize: 15,
        color: '#fff',
        marginRight: 4,
    },
    refreshButtonText: {
        fontSize: 15,
        color: '#fff',
        marginRight: 4,
    },

    remainsContainer: {
        marginTop: 10,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    remainsTitle: {
        fontSize: 13,
        color: '#fff',
        backgroundColor: 'transparent',
    },
    remainsValue: {
        fontSize: 77,
        color: '#fff',
        backgroundColor: 'transparent',
    },
    remainsExpire: {
        fontSize: 12,
        color: '#fff',
        backgroundColor: 'transparent',
    },

    rowContainer: {
        flexDirection: 'row',
        paddingTop: 13,
        paddingBottom: 13,
        marginLeft: 13,
        marginRight: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
        justifyContent: 'space-between',
    },
    columnContainer: {
        flexDirection: 'column',
    },
    cellContainer: {
        flexDirection: 'row',
        width: util.SCREEN_WIDTH - 26,
    },
    cellButtonGroup: {
        justifyContent: 'space-between',
        width: util.SCREEN_WIDTH - 26,
    },
    cellTitle: {
        fontSize: 12,
        color: '#fff',
        marginRight: 24,
    },
    cellValue: {
        fontSize: 12,
        color: '#fff',
        width: util.SCREEN_WIDTH - 176,
        backgroundColor: 'transparent',
    },
    cellText: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    cellButtonBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        width: 80,
    },
    cellButton: {
        marginLeft: 10,
    },
    cellButtonText: {
        color: '#052d60',
    },
    taskText: {
        color: '#fff',
        fontSize: 12,
        backgroundColor: 'transparent',
    },
    taskRow: {
        justifyContent: 'space-between',
        marginTop: 10,
    },

    bottomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 13,
        marginRight: 13,
        marginTop: 18,
        borderRadius: 2,
    },
    bottomButton: {
        backgroundColor: '#052d60',
        borderRadius: 18,
        width: 152,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomButtonText: {
        fontSize: 15,
        color: '#fff',
    },
    orText: {
        fontSize: 15,
        color: '#fff',
    },
    textImportant: {
        color: '#052d60',
    },

    backButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
});