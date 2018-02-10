'use strict';

import { Dimensions, StyleSheet } from 'react-native';
import { Platform } from 'react-native';
import CodePush from 'react-native-code-push';

const DeviceInfo = require('react-native-device-info');

// 是否为debug模式
export const DEBUG = true;
// 内部应用版本号
export const VERSION = '0.2.0';
// 二进制包版本号
export const BINARY_VERSION = DeviceInfo.getVersion();
// 配置中渠道key
export const CHANNEL_KEY = 'UMENG_CHANNEL';
// API 前缀
export const HOSTS = {
    //API: 'http://139.196.160.162:8088',
    //UPGRADE: 'http://139.196.160.162:8088',
    //API: 'http://api.0714mai.com',
    //UPGRADE: 'http://api.0714mai.com',
    //API: 'http://192.168.188.232:8080',
    //UPGRADE: 'http://192.168.188.232:8080',
    API: 'http://api.youdoutu.cn',
    UPGRADE: 'http://api.youdoutu.cn',
};
// 热更新用到的部署key
export const DEPLOYMENT_KEYS = {
    android: {
        STAGING: 'jDpDU00CVjZun6TWznFyO822Zidf545c5e18-5e5a-4ece-b0e8-6bd8e703cc69',
    },
    ios: {
        STAGING: null,
    },
};

// CodePush 的配置选项
export const CODEPUSH_OPTIONS = {
    // 检测更新的频率
    // 当前设置为：每次应用激活时
    //checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
    // 部署key
    deploymentKey: DEPLOYMENT_KEYS[Platform.OS].STAGING,
    // 安装模式
    // 当前模式：静默安装
    installMode: CodePush.InstallMode.IMMEDIATE,
    // 升级提示框
    updateDialog: {
        mandatoryContinueButtonLabel: '立即安装',
        mandatoryUpdateMessage: '重要更新，请务必安装',
        optionalIgnoreButtonLabel: '忽略',
        optionalInstallButtonLabel: '安装',
        optionalUpdateMessage: '有可用新版本，您想立即安装吗？',
        title: '有新版本啦!',
    },
};

export const Window = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
}

export const RefreshState = {
    Idle: 0,
    HeaderRefreshing: 1,
    FooterRefreshing: 2,
    NoMoreDataFooter: 3,
    NoMoreDataHeader: 4,
    Failure: 5,
};

export const CALL_API = 'Call API';
export const CALL_STORAGE = 'CALL STORAGE';
// 启动密码
export const LAUNCH_PASSWORD = 'launchPassword';
// 观看历史
export const WATCHING_HISTORY = 'watchingHistory';
// 最大观看历史数
export const MAX_WATCHING_HISTORY = 20;
// 用户会话
export const USER_SESSION = 'userSession';
// 心跳请求的延迟
export const HEARTBEAT_DELAY = 10000;
// Deep Link 使用的协议
export const DEEPLINK_SCHEMA = 'xingren';
// 静态文件缓存名称
export const CACHE_DIR_PREFIX = 'xrcache';

export const NUM_PER_PAGE = 18;