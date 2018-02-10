'use strict';

import {
    WATCHING_HISTORY,
    MAX_WATCHING_HISTORY,
    USER_SESSION,
} from '../Constants';

/**
 * 记录观看历史
 * @param word
 */
export const saveWatchingHistory = async (word: string) => {
    if (word) {
        let words = await loadWatchingHistory();
        if (!Array.isArray(words)) {
            words = [];
        }
        // 保持数量
        while (words.length >= MAX_WATCHING_HISTORY) {
            words.pop();
        }
        if (words.indexOf(word) > -1) {
            words.splice(words.indexOf(word), 1);
        }
        words.splice(0, 0, word);
        storage.save({ key: WATCHING_HISTORY, data: words });
    }
};

/**
 * 读取观看历史
 * @returns {Promise.<*>}
 */
export const loadWatchingHistory = async () => {
    try {
        return await storage.load({ key: WATCHING_HISTORY });
    } catch (err) {
        return [];
    }
};

/**
 * 读取用户会话
 * @returns {Promise.<{authorizedKey: boolean, email: boolean, id: number, name: boolean}>}
 */
export const loadUserSession = async () => {
    try {
        return await storage.load({ key: USER_SESSION });
    } catch (err) {
        return {
            authorizedKey: false,
            email: false,
            id: 0,
            name: false,
        };
    }
};

/**
 * 保存用户会话
 * @param userSession
 * @returns {Promise.<Object>}
 */
export const saveUserSession = async (userSession: object) => {
    return await storage.save({key: USER_SESSION, data: userSession});
};

/**
 * 移除用户会话
 * @returns {Promise.<*>}
 */
export const removeUserSession = async () => {
    return await storage.remove({key: USER_SESSION});
};

module.exports = {
    loadUserSession,
    saveUserSession,
    removeUserSession,
};