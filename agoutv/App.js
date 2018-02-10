'use strict';
import React, { Component } from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    Platform,
} from 'react-native';
import  { Provider } from 'react-redux';
import * as Progress from 'react-native-progress';
import CodePush from "react-native-code-push";
import AppMetadata from 'react-native-app-metadata';
import { DEBUG, VERSION, BINARY_VERSION, LAUNCH_PASSWORD, CODEPUSH_OPTIONS, HEARTBEAT_DELAY, CHANNEL_KEY, DEEPLINK_SCHEMA } from "./src/Constants";
import AgouTvApp from './src/container';
import * as api from "./src/middlewares/api";
import configureStore from './src/store/index';
import BinaryUpgrader from './src/BinaryUpgrader';
import SpreadInstance from './src/common/SpreadInstance';

import SplashScreen from 'react-native-smart-splash-screen';

const analyticsUtil = require('./src/common/AnalyticsUtil');

export default class App extends Component<{}> {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            //selectedTab:'home',
            store:configureStore(() => { this.initialize() }),
            tipText: '当前版本：' + AppMetadata.ShortVersion,
            downloadProgress: 0,
        }

        this.codePushDownloadDidProgress = this.codePushDownloadDidProgress.bind(this);
        this.codePushStatusDidChange = this.codePushStatusDidChange.bind(this);
        this.binaryPushStatusDidChange = this.binaryPushStatusDidChange.bind(this);
    }
    componentWillMount(){
        // 关闭启动屏幕
        SplashScreen.close({
            animationType: SplashScreen.animationType.scale,
            duration: 800,
            delay: 500,
        });
    }
    componentDidMount() {
        try{
            analyticsUtil.pageStart('Setup');
        } catch (e) {
            console.log(e);
        }
    }

    componentWillUnmount() {
        try{
            analyticsUtil.pageEnd('Setup');
        } catch (e) {
            console.log(e);
        }

    }

    async initialize() {
        // 全局启动配置
        global.launchSettings = {
            // 获取渠道
            channelID: await AppMetadata.getAppMetadataBy(CHANNEL_KEY),
            // 是否是安卓
            // 是否是安卓
            isAndroid: Platform.OS === 'android',
            // 读取接口主机地址
            apiHosts: await api.loadHosts(),
        };

        if (launchSettings.isAndroid) {
            StatusBar.setBackgroundColor('#fff');
        }
        let result = await api.launch();
        if (result.code === 0) {
            // 用户是否来自中国
            //result.data.isChina = await api.isChina(result.data.ip);
            result.data.isChina = await storage.load({ key: 'isChina', id: result.data.ip });
            // 生成推广实例
            result.data.spi = SpreadInstance.create(result.data.spi);
            // 加载过的一次性公告列表
            result.data.loadedInitialMessages = await storage.load({ key: 'loadedInitialMessages' });
            // 加入全局配置
            global.launchSettings = {
                ...launchSettings,
                ...result.data,
                // 计算与服务器的时间差
                deltaSeconds: result.time - parseInt(Date.now() / 1000),
            };
            // 检查二进制包是否有更新
            //this.checkJSBundleVersion();
            this.checkBinaryVersion();
        } else {
            if (result.code === 504) {
                this.setState({
                    tipText: '网络不给力，请求超时啦'
                });
            } else {
                this.setState({
                    tipText: '初始化错误:' + result.message,
                });
            }
        }
    }

    checkBinaryVersion() {
        BinaryUpgrader.getInstance().check(this.binaryPushStatusDidChange, this.codePushDownloadDidProgress);
    }

    checkJSBundleVersion() {
        CodePush.sync(CODEPUSH_OPTIONS, this.codePushStatusDidChange, this.codePushDownloadDidProgress);
    }

    binaryPushStatusDidChange(status) {
        //console.log('binaryPushStatusDidChange', status);
        switch (status) {
            case CodePush.SyncStatus.UP_TO_DATE: //当前已是最新版
                this.setState({ tipText: '当前版本：' + VERSION });
                return this.checkJSBundleVersion();
            case CodePush.SyncStatus.UPDATE_IGNORED: //用户忽略升级
                this.setState({ tipText: '当前版本：' + VERSION });
                return this.launch();
            case CodePush.SyncStatus.UPDATE_INSTALLED: // 更新成功安装
                this.setState({ tipText: '更新完成' });
                return this.checkJSBundleVersion();
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE: // 正在检查更新
                return this.setState({ tipText: '正在检查更新' });
            case CodePush.SyncStatus.INSTALLING_UPDATE: // 正在安装更新
                return this.setState({ tipText: '正在安装更新', downloadProgress: 0, });
            case CodePush.SyncStatus.UNKNOWN_ERROR: // 未知错误
                this.setState({ tipText: '发生未知错误，更新失败' });
                return this.launch();
            case CodePush.SyncStatus.AWAITING_USER_ACTION: // 等待用户动作
                return this.setState({ tipText: '发现有可用新版本' });
            case CodePush.SyncStatus.SYNC_IN_PROGRESS: // 同步进行中
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE: //正在下载更新包
                // 不作处理
                return;
        }
        this.launch();
    }

    codePushStatusDidChange(status) {
        //console.log('codePushStatusDidChange', status);
        switch (status) {
            case CodePush.SyncStatus.UP_TO_DATE: //当前已是最新版
            case CodePush.SyncStatus.UPDATE_IGNORED: //用户忽略升级
                this.setState({ tipText: '当前版本：' + VERSION });
                return this.launch();
            case CodePush.SyncStatus.UPDATE_INSTALLED: // 更新成功安装
                this.setState({ tipText: '更新完成' });
                return CodePush.restartApp(false);
            case CodePush.SyncStatus.CHECKING_FOR_UPDATE: // 正在检查更新
                return this.setState({ tipText: '正在检查更新' });
            case CodePush.SyncStatus.INSTALLING_UPDATE: // 正在安装更新
                return this.setState({ tipText: '正在安装更新', downloadProgress: 0, });
            case CodePush.SyncStatus.UNKNOWN_ERROR: // 未知错误
                this.setState({ tipText: '发生未知错误，更新失败' });
                return this.launch();
            case CodePush.SyncStatus.AWAITING_USER_ACTION: // 等待用户动作
                return this.setState({ tipText: '发现有可用新版本' });
            case CodePush.SyncStatus.SYNC_IN_PROGRESS: // 同步进行中
            case CodePush.SyncStatus.DOWNLOADING_PACKAGE: //正在下载更新包
                // 不作处理
                return;
        }
        this.launch();
    }

    codePushDownloadDidProgress(progress) {
        //console.log('codePushDownloadDidProgress', progress);
        if (typeof progress === 'object') {
            // 进度提示
            this.setState({
                tipText: '正在下载更新：' + progress.receivedBytes + '/' + progress.totalBytes,
                // 更新下载进度
                downloadProgress: progress.receivedBytes / progress.totalBytes,
            });
        } else {
            this.setState({
                tipText: '正在下载更新：' + progress + '%',
                downloadProgress: progress / 100,
            });
        }
    }

    async launch() {
        this.setState({isLoading: false});
    }




    render() {
        if (this.state.isLoading) {
            const downloadProgressBar = (
                <Progress.Bar
                    color="#052D60"
                    borderColor="#052D60"
                    progress={this.state.downloadProgress}
                    style={styles.progressBar}
                    width={120}
                />
            );
            return (
                <View style={styles.background}>
                    <Image
                        source={require('./src/pages/imgs/agou.png')}
                        style={styles.logo}
                    />
                  <ActivityIndicator style={styles.loading} />
                    {this.state.tipText ? <Text style={styles.tip}>{this.state.tipText}</Text> : null}
                    {this.state.downloadProgress > 0 ? downloadProgressBar : null}
                </View>
            );
        }
        return (
            <Provider store = {this.state.store}>
              <View style={{flex:1}}>
                <AgouTvApp />
              </View>
            </Provider>
        );
    }
}
const styles = StyleSheet.create({
    background: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center'
    },
    logo: {
        width: 144,
        height: 144,
        marginTop: 180,
    },
    loading: {
        position: 'absolute',
        bottom: 100,
    },
    tip: {
        color: '#808080',
        fontSize: 12,
        position: 'absolute',
        bottom: 50,
    },
    progressBar: {
        position: 'absolute',
        bottom: 30,
    },
});