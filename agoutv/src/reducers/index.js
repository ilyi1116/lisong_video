import Immutable from 'immutable';
import {
    combineReducers
} from 'redux-immutable';

const initialState = Immutable.fromJS({
    isLoading: false,
});

const loading = (state = initialState, action) => {
    let command = action.type.split('_').splice(-1)[0];
    switch (command) {
        case 'REQUEST':
            return state.set('isLoading', true);
        case 'SUCCESS':
        case 'FAILURE':
            return state.set('isLoading', false);
    }
    return state;
};

const rootReducer = combineReducers({
    loading,
    main: require('./main'),
    explore: require('./explore'),
    video: require('./video'),
    user: require('./user'),
    subscribe: require('./subscribe'),
    collection: require('./collection'),
    history: require('./history'),
    spread: require('./spread'),
});

export default rootReducer;