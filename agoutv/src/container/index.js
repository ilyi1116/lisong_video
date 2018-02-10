import React from 'react';
import { StackNavigator, TabNavigator, NavigationActions } from 'react-navigation';
import HomePage from '../pages/Home/index';
import ExplorePage from '../pages/Explore/index';
import ExploreSearchPage from '../pages/Explore/search';
import SubscribePage from '../pages/Subscribe/index';
import SelfPage from '../pages/Self/index';

import MoviePlayScreen from '../pages/Movie/play';
import LoginScreen from '../pages/User/login';
import PlayTestScreen from '../pages/Home/playtest';
import CollectionPage from '../pages/Self/collection'
import HistoryPage from '../pages/Self/history'
import SelfInfoPage from '../pages/Self/selfInfo';
import SpreadPage from '../pages/Self/spread';

let HomeNav = StackNavigator({
    HomePage: {
        screen: HomePage,
    }
})

let ExploreNav = StackNavigator({
    ExplorePage: {
        screen: ExplorePage,
    },
    // ExploreSearchPage: {
    //     path: 'ExploreSearchPage',
    //     screen: ExploreSearchPage,
    // }

})

let SubscribeNav = StackNavigator({
    SubscribePage: {
        screen: SubscribePage,
    }
})

let SelfNav = StackNavigator({
    SelfPage: {
        screen: SelfPage,
    },
    CollectionPage: {
        path: 'CollectionPage',
        screen: CollectionPage,
    },
    HistoryPage: {
        path: 'HistoryPage',
        screen: HistoryPage,
    },
    SelfInfoPage: {
        path: 'SelfInfoPage',
        screen: SelfInfoPage,
    },
},{
    headerMode: 'screen',
});

const MainTab = TabNavigator({
    Home: {
        screen: HomeNav,
    },
    Explore: {
        screen: ExploreNav,
    },
    Subscribe: {
        screen: SubscribeNav,
    },
    Self: {
        screen: SelfNav,
    },
}, {
    tabBarPosition: 'bottom',
    animationEnabled: false,
    lazy: true,
    swipeEnabled: false,
    tabBarOptions: {
        showIcon:true,
        activeTintColor: '#052D60',
        inactiveTintColor: '#c0c0c0',
        labelStyle: {
            fontSize: 10,
            margin:0,
            padding:0,
        },
        indicatorStyle: {
            backgroundColor: "#fff",
            height: 0,
        },
        style: {
            backgroundColor: '#fff',
        },

    },
});

const MyApp = StackNavigator({
    // LoginScreen: {
    //     path:'LoginScreen',
    //     screen: LoginScreen,
    // },
    // PlayTest: {
    //     screen: PlayTestScreen,
    // },
    MainTab: {
        path:'MainTab',
        screen: MainTab,
    },
    MoviePlayScreen:{
        path: 'MoviePlayScreen',
        screen: MoviePlayScreen
    },
    SpreadPage: {
        path: 'SpreadPage',
        screen: SpreadPage,
    },
},{
    headerMode:'none'
});

const navigateOnce = (getStateForAction) => (action, state) => {
    const {type, routeName} = action;
    return (
        state &&
        type === NavigationActions.NAVIGATE &&
        routeName === state.routes[state.routes.length - 1].routeName
    ) ? null : getStateForAction(action, state);
};
MyApp.router.getStateForAction = navigateOnce(MyApp.router.getStateForAction);

export default  MyApp;