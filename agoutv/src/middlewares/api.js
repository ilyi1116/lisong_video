'use strict';

import { camelizeKeys } from 'humps';

import * as cryptor from '../common/Cryptor';
import {CALL_API, VERSION, HOSTS, CHANNEL_KEY} from "../Constants";

const DeviceInfo = require('react-native-device-info');
const util = require('../common/Util');
const storageApi = require('../common/Storage');

const API_ROOT = HOSTS.API + '/api/app/';

/**
 * 主机配置文件
 * @type {[string,string,string]}
 */
const HOST_CONFIG_FILES = [
];
export const safeCallApi = async (endpoint: string, options:Object = {}, maxRetry: number = 3, retryDelay: number = 3) => {
    let _callApi = async (resolve, reject) => {
        try {
            let result = await callApi(endpoint, options);
            if (result.code === 0) {
                if (resolve)
                    return resolve(result);

                return result;
            }
        } catch (error) {
            if (maxRetry <= 0) {
                return resolve({ code: 500, message: error });
            }
        }

        if (maxRetry <= 0) {
            return resolve({ code: 503, message: '网络貌似不太好，请重试' });
        }

        setTimeout(() => _callApi(resolve, reject), retryDelay * 1000);
        maxRetry --;
    };
    return new Promise(_callApi)
};

export const callApi = async (endpoint, options:Object = {}) => {
    const fullUrl = (endpoint.indexOf(API_ROOT) == -1) ? API_ROOT + endpoint : endpoint;

    console.log('CALL:', fullUrl);

    if (typeof options.headers === 'undefined') {
        options.headers = {};
    }
    // 设置User-Agent
    options.headers['User-Agent'] = await util.makeUserAgent();

    // 读取用户会话
    let us = await storageApi.loadUserSession();
    if (us.authorizedKey) {
        options.headers['Authorized-Key'] = us.authorizedKey;
    }
    // 会话id
    options.headers['SESSION-ID'] = launchSettings.sessionId || DeviceInfo.getUniqueID();

    return Promise.race([
        fetch(fullUrl, options),
        //util.timeout(15000),
    ]).then(response =>
        response.json().then(json => {
            if (!response.ok) {
                return Promise.reject(json);
            }

            const camelizedJson = camelizeKeys(json);
            // 每次接口被调用后
            // 只要成功返回，均传回服务端的时间
            if (launchSettings && camelizedJson.time) {
                // 与服务器的时间差
                launchSettings.deltaSeconds = camelizedJson.time - parseInt(Date.now()/1000);
            }

            if (camelizedJson.code !== 0) {
                return Promise.reject({message: camelizedJson});
            }

            return camelizedJson;
        })
    );
};

export default store => next => action => {
    const callAPI = action[CALL_API];
    if (typeof callAPI == 'undefined') {
        return next(action);
    }

    let { endpoint } = callAPI;
    const {options, type} = callAPI;

    if (typeof endpoint === 'function') {
        endpoint = endpoint(store.getState());
    }

    if (typeof endpoint !== 'string') {
        throw new Error('Endpoint was invalid.')
    }
    if (options && typeof(options) != 'object') {
        throw new Error('Expected options type to be object.');
    }
    if (typeof type !== 'string') {
        throw new Error('Expected action type to be string.');
    }

    const actionWith = data => {
        const finalAction = Object.assign({}, action, data);
        delete finalAction[CALL_API];
        return finalAction;
    };

    next(actionWith({ type: type + '_REQUEST' }));


    return callApi(endpoint, options)
        .then(
            response => next(actionWith({
                response,
                type: type + '_SUCCESS'
            })),
            error => next(actionWith({
                type: type + '_FAILURE',
                error: error.message || 'Something bad happended'
            }))
        );
};

/**
 * 提取错误
 * @param err
 * @returns {{code: number, message: string}}
 */
export const takeError = (err) => {
    // 默认错误码
    let code = 500, message = 'Something bad happended';

    if (typeof err.message === 'object') {
        // 服务端返回的错误（不是异常）, err.message 是一个对象 {code, message}
        code = err.message.code;
        message = err.message.message;
    } else if (typeof err.message === 'string') {
        // 系统抛出的异常
        // err.message 是一个字符串
        message = err.message;

    } else if (typeof err === 'string') {
        // 其他情况
        message = err;
    }
    return {
        code, message,
    };

};

export const loadHosts = async () => {
    if (HOST_CONFIG_FILES.length > 0) {
        for (let hostConfigUrl of HOST_CONFIG_FILES) {
            try {
                let response = await fetch(hostConfigUrl);
                let hosts = await response.json();
                if (hosts) {
                    console.log('LOAD_HOSTS', hosts);
                    return hosts;
                }
            } catch (err) {
                console.error(err);
                continue;
            }
        }
    }

    // 是否使用默认的接口地址
    return {
        api: HOSTS.API,
        update: HOSTS.UPGRADE,
    };
};

/**
 * 调用launch接口
 * @returns {Promise.<*>}
 */
export const launch = async () => {
    try {
        // 获取
        let channelID = launchSettings.channelID;
        // 生成双key
        let keys = await cryptor.clockSyncEncrypt(channelID, await storage.load({ key: 'IMEI' }));
        // 获取设备信息
        let deviceInfo = encodeURIComponent(JSON.stringify(util.getDeviceInfo()));
        return await callApi(`launch_v2?channel_id=${channelID}&key=${encodeURIComponent(keys.key)}&skey=${encodeURIComponent(keys.skey)}&time=${keys.time}&device_info=${deviceInfo}`);
    } catch (err) {
        return takeError(err);
    }
};

/**
 * 调用升级检查接口
 * @param os
 * @returns {Promise.<*>}
 */
export const checkUpgrade = async (os) => {
    try {
        return await callApi('checkUpgrade/' + os + '?channel_id=' + launchSettings.channelID);
    } catch (err) {
        return takeError(err);
    }
};

/**
 * 获取IP地址详细
 * @param ip
 * @returns {Promise.<*>}
 */
export const explainIPAddress = async (ip) => {
    try {
        let response = await fetch('https://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=' + ip);
        let result = await response.json();
        if (result.ret === 1) {
            return {
                code: 0,
                message: 'success',
                data: result,
            }
        }
        return {
            code: result.ret,
            message: 'found error',
            data: result,
        }
    } catch (err) {
        return takeError(err);
    }
};

/**
 * IP是否来自中国
 * @param ip
 * @returns {Promise.<void>}
 */
export const isChina = async (ip) => {
    let result = await explainIPAddress(ip);
    return (result.code === 0 && result.data.country === '中国') || result.code !== 0;
};

/**
 * 调用心跳接口
 */
export const heartbeat = async () => {
    console.log('heartbeat', parseInt(Date.now() / 1000));
    let keys = await cryptor.clockSyncEncrypt('heartbeat', launchSettings.sessionId);
    callApi(`heartbeat`, {
        method: 'post',
        body: util.dictToFormData({
            key: keys.key,
            skey: keys.skey,
        }),
    });
};

/**
 * 广告点击接口
 * @param adID
 */
export const clickAd = (adID: number) => {
    callApi(`ad/download`, {
        method: 'post',
        body: util.dictToFormData({
            ad_id: adID,
        }),
    });
};