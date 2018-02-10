'use strict';

import type {Dispatch, GetState, ThunkAction} from "./types";
import {CALL_API, CALL_STORAGE} from "../Constants";

const util = require('../common/Util');

const _logOut = (): ThunkAction => ({
    params: {
        stateKeys: ['userData'],
    },
    [CALL_STORAGE]: {
        type: 'LOGOUT_USER',
        method: 'removeUserSession',
    },
});

/**
 * 退出登录
 */
export const logOut = () => (dispatch: Dispatch, getState: GetState) => {
    let state = getState();
    let action = _logOut();
    if (!state.hasIn(['user'].concat(action.params.stateKeys))) {
        return null;
    }

    return dispatch(_logOut());
};

const _logIn = (code, state): ThunkAction => {
    return {
        params: {
            stateKeys: ['userData'],
        },
        [CALL_API]: {
            type: 'LOGIN_USER',
            endpoint: 'user/login/weixin/callback',
            options: {
                method: 'post',
                body: util.dictToFormData({
                    code:code,
                    state:state
                }),
            },
        },
    };
};

/**
 * 登录
 * @param userName
 * @param userPwd
 */
export const wxLogIn = (code, state) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_logIn(code, state));
};



const _loadSession = (): ThunkAction => ({
    params: {
        stateKeys: ['userData'],
    },
    [CALL_STORAGE]: {
        type: 'LOAD_USER_SESSION',
        method: 'loadUserSession',
    },
});

/**
 * 加载用户会话
 */
export const loadSession = () => (dispatch: Dispatch, getState: GetState) => {
    let state = getState();
    let action = _loadSession();
    let session = state.getIn(['user'].concat(action.params.stateKeys));
    // if (typeof session === 'object' && typeof session.authorizedKey !== 'undefined') {
    //     return null;
    // }

    return dispatch(action);
};