'use strict';

import type {Action} from "../actions/types";
import Immutable from 'immutable';
import {saveUserSession} from "../common/Storage";

const util = require('../common/Util');

const initialState = Immutable.fromJS({
});


const user = (state = initialState, action: Action) => {
    if (action.type.indexOf('_USER') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state.deleteIn(errorKey);
        }

        switch (action.type) {
            case 'LOGOUT_USER_SUCCESS':
                return state.setIn(action.params.stateKeys, {
                    login: false,
                });
            case 'LOGIN_USER_SUCCESS': // 用户登录成功
                // 设置用户名
                let us = action.response.data;

                // 记录状态
                saveUserSession(us);
                // 设置状态
                return state.setIn(action.params.stateKeys, {
                    ...us,
                    login: true,
                });
            case 'LOGIN_USER_FAILURE': // 登录出错
                return state
                    .setIn(action.params.stateKeys.concat(['processID']), Date.now())
                    .setIn(action.params.stateKeys.concat(['error']), {
                        ...util.safeError(action.error),
                    });
            case 'LOAD_USER_SESSION_SUCCESS': // 读取用户会话成功
                return state.setIn(action.params.stateKeys, action.data);
        }

    }
    return state;
};

module.exports = user;