'use strict';

import type {ThunkAction, Dispatch, GetState} from "./types";
import {CALL_API} from "../Constants";
const util = require('../common/Util');
const loadHistoriesAction = (refreshState: number, retOffset: number = 20) : ThunkAction => ({
    params: {
        offset:retOffset,
        stateKeys: ['root'],
    },
    [CALL_API]: {
        type: 'LOAD_HISTORIES',
        endpoint: `video/get/history?offset=${retOffset}&limit=20`,
        refreshState: refreshState,
    },
});

export const loadHistories = (refreshState: number, retOffset: number = 20) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(loadHistoriesAction(refreshState, retOffset));
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const reloadHistoriesAction = (refreshState: number) : ThunkAction => ({
    params: {
        offset:20,
        stateKeys: ['root'],
    },
    [CALL_API]: {
        type: 'RELOAD_HISTORIES',
        endpoint: `video/get/history`,
        refreshState: refreshState,
    },
});

export const reloadHistories = (refreshState: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(reloadHistoriesAction(refreshState));
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const deleteHistoryAction = (movieId:number, seriaId:number) : ThunkAction => ({
    params: {
        seriaId:seriaId,
        stateKeys: ['root'],
    },
    [CALL_API]: {
        type: 'DELETE_HISTORIES',
        endpoint: `video/delete/history`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: movieId,
                serials_src_id: seriaId
            }),
        },
    },
});

export const deleteHistory = (movieId: number, seriaId:number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(deleteHistoryAction(movieId, seriaId));
};
