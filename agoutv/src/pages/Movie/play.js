'use strict';

import React from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    StatusBar,
    TouchableOpacity,
    Image,
    ImageBackground,
    Text
} from 'react-native';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import Toast from 'react-native-root-toast';
import KeepAwake from 'react-native-keep-awake';
import PropTypes from 'prop-types';
import { Loading } from '../../components/XingrenEasyLoading';
import {
    loadVideoDetail,
    addSubscribe,
    deleteSubscribe,
    addFav,
    deleteFav,
    deleteSeriaFav,
    addSeriaFav,

    playVideo,
    loadSessionStatus,
} from '../../actions/video';

import VideoPlayer from '../../components/VideoPlayer';
import BaseComponent from "../../components/BaseComponent";
import { MovieDetail } from "./movieDetail";

const util = require('../../common/Util');

const PlayStatus = {
    Stop: 'Stop',
    Loading: 'Loading',
    Check: 'Check',
    Start: 'Start',
    Playing: 'Playing',
    End: 'End',
    Error: 'Error',
    Disabled: 'Disabled',
    TimesUsedUp: 'TimesUsedUp',
};

class MoviePlayScreen extends BaseComponent {
    static navigationOptions = {
        header: null,
        tabBarVisible: false,
    };

    constructor(props) {
        super(props);

        this._actionSheet = null;
        this._renderInfo = this._renderInfo.bind(this);
        this._renderLoading = this._renderLoading.bind(this);
        // 当前状态
        this.status = PlayStatus.Stop;
        // 状态变更时间
        this.statusTime = Date.now();
    }

    static propTypes = {
        code :PropTypes.string.isRequired,
        video:PropTypes.object,
        episode:PropTypes.number,
    };

    static defaultProps = {
        code:'',
        video:{}
    };

    componentDidMount() {
        // 默认隐藏掉状态栏
        StatusBar.setHidden(true);
        this.props.loadVideoDetail(this.props.code);
        if (this.dataIsValid()) {
            this.props.loadSessionStatus(this.props.video.id, this.props.video.playLink.playLink, this.props.video.playLink.src);
        }
    }

    componentWillUnmount() {
        StatusBar.setHidden(false);
    }

    async componentWillReceiveProps(nextProps) {
        super.componentWillReceiveProps(nextProps);
        if (nextProps.video.spi && nextProps.video.spi.timeUpdated > this.statusTime) {
            if (nextProps.video.spi.allowPlay) {
                if (!launchSettings.spi.isInfiniteInvalid) {
                    Toast.show('今日观影券剩余' + launchSettings.spi.remainsPlay + ' 张');
                }
                this._changeStatus(PlayStatus.Start);
            } else {
                if (nextProps.video.error.code === 405) {
                    this._changeStatus(PlayStatus.TimesUsedUp);
                } else {
                    this._changeStatus(PlayStatus.Disabled);
                    Toast.show(nextProps.video.error.message);
                }
            }
        }
    }
    getData(props) {
        props = props || this.props;
        return props.video;
    }

    dataIsValid(props) {
        props = props || this.props;
        return props.video && props.video.id && props.video.playLink;
    }

    _changeStatus(status) {
        this.status = status;
        this.statusTime = Date.now();
    }

    _renderLoading() {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator />
            </View>
        );
    }

    _renderInfo() {
        return (
          <MovieDetail {...this.props}/>
        );
    }

    _onProgress() {
        this._changeStatus(PlayStatus.Playing);
    }

    _onPlay = (code, video, episode) => {
        if(this.dataIsValid()) {
            let episodeValue = video.playLink[episode];
            if (episodeValue) {
                this.props.playVideo(video.id, code, episode, episodeValue.serialsSrcId);
            }
        }
    }

    _onPlayError() {
        this._changeStatus(PlayStatus.Error);
    }

    _onPlayEnd() {
        this._changeStatus(PlayStatus.End);
    }

    _onPlayStart() {
        this._changeStatus(PlayStatus.Playing);
    }

    _onBackward() {
        this.props.navigation.goBack();
    }

    _isRenderPlayer() {
        return this.status === PlayStatus.Start || this.status === PlayStatus.Playing || this.status === PlayStatus.End || this.status === PlayStatus.Error;
    }

    _isTimesUsedUp() {
        return this.status !== PlayStatus.TimesUsedUp
    }

    _onAddPlay() {
        this.props.navigation && this.props.navigation.navigate('SpreadPage');
    }

    _renderPlayer(video, episodeObj) {
        let movieId = video.id;
        let platformId = episodeObj.src;
        let episodeNum = episodeObj.episode;
        return (
                <VideoPlayer
                    video={{id: movieId,platformId:platformId,episode:episodeNum}}
                    forceFullScreen={false}
                    onBackward={this._onBackward.bind(this)}
                    onStart={this._onPlayStart.bind(this)}
                    onEnd={this._onPlayEnd.bind(this)}
                    onError={this._onPlayError.bind(this)}
                    onProgress={this._onProgress.bind(this)}
                />
        );
    }

    _renderUI() {
        if (!this.props.video|| !this.props.video.playLink) {
            return null;
        }

        if (this._isRenderPlayer()) {
            let currentEpisode = this.props.episode;
            let episodeObj = this.props.video.playLink[currentEpisode];
            if (episodeObj) {
                return this._renderPlayer(this.props.video, episodeObj);
            }
        }
        return this._renderCover();
    }
    _renderCover() {
        const playButton = (
            <TouchableOpacity onPress={()=>this._onPlay(this.props.code, this.props.video, this.props.episode)}>
                <Image style={styles.playButton} source={require('../../components/imgs/VideoPlayerV2/icon_fullscreen_play.png')}/>
            </TouchableOpacity>
        );

        const unplayableButton = (
            <TouchableOpacity style={styles.unplayableTip} onPress={this._onAddPlay.bind(this)}>
                <Text style={styles.unplayableTipText}>今日观影券已用完, </Text>
                <Text style={[styles.unplayableTipText, {color: '#052d60'}]}>立即增加</Text>
            </TouchableOpacity>
        );

        return (
            <ImageBackground style={styles.cover} source={{uri: this.props.video.cover}}>
                {this._isTimesUsedUp() ? (this.status === PlayStatus.Check ? this._renderLoading() : playButton) : unplayableButton}
            </ImageBackground>
        );
    }

    render() {
        return (
            <View style={styles.background}>
                {this._renderUI()}
                {this.props.video ? this._renderInfo(this.props.video, this.props.episode, this.props.code) : this._renderLoading()}
                <KeepAwake />
                <Loading />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    background: {
        backgroundColor: '#fff',
        flex: 1,
    },
    playButton: {
        width: 40,
        height: 40,
    },
    actionSheetContentContainer: {
        flex: 1,
        width: util.getScreenWidth(),
        alignItems: 'center',
        justifyContent: 'center',
    },
    unplayableTip: {
        padding: 12,
        backgroundColor: '#9A89E4',
        opacity: 0.8,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    unplayableTipText: {
        color: '#fff',
        fontSize: 14,
    },
    cover: {
        minWidth: util.SCREEN_WIDTH,
        minHeight: 210,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const mapStateToProps = (state, ownProps) => {
    const code = ownProps.navigation.state.params.code;
    let episode = ownProps.navigation.state.params.episode;
    let data = state.getIn(['video', 'video', code]);
    if (Immutable.Map.isMap(data)) {
        data = data.toJS();
    }
    if(data && data.episode && data.episode > 0){
        episode = data.episode;
    }

    return {
        code,
        episode,
        video: data,
    };
};

export default connect(mapStateToProps, {
    loadVideoDetail,
    addSubscribe,
    deleteSubscribe,
    addFav,
    deleteFav,
    deleteSeriaFav,
    addSeriaFav,

    playVideo,
    loadSessionStatus,
})(MoviePlayScreen);