'use strict';

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ImageBackground,
    ActivityIndicator,
    TouchableOpacity,
    PanResponder,
    Dimensions,
    FlatList,
    Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import Orientation from 'react-native-orientation';
import RCTIJKPlayer from 'react-native-ijkplayer';
import Toast from 'react-native-root-toast';
import XingrenActionSheet from '../components/XingrenActionSheet';
import {loadStreams} from '../actions/video';

const util = require('../common/Util');
const spider = require('../common/Spider');

export default class VideoPlayer extends React.Component {

    static propTypes = {
        video: PropTypes.object,
        source: PropTypes.string,
        forceFullScreen: PropTypes.bool.isRequired,
        onBackward: PropTypes.func.isRequired,
        onStart: PropTypes.func,
        onEnd: PropTypes.func,
        onError: PropTypes.func,
        onProgress: PropTypes.func,
    };

    static defaultProps = {
        forceFullScreen: false,
    };

    progressHandler = (null : ?{ setNativeProps(props: Object): void });

    constructor(props) {
        super(props);

        // 播放器实例
        this.player = null;
        this._streamDrawer = null;

        this.translateX = 110;

        this.state = {
            streamSheetAnim: new Animated.Value(this.translateX),
            // 视频是否在加载中
            isVideoLoading: true,
            // 是否显示控制界面
            showControl: true,
            // 是否显示播放暂停按钮
            showPlayPauseButton: true,
            // 视频是否在缓冲
            isVideoBuffering: false,
            // 是否已经开始播放
            paused: false,
            // 进度条最大宽度
            progressMaxWidth: 240,
            // 缓冲进度条宽度
            bufferedBarWidth: 0,
            // 播放进度条宽度
            progressBarWidth: 0,
            // 是否开始播放
            isStartPlay: false,
            // 总时间
            duration: false,
            // 总时间的文本形式
            durationText: false,
            // 当前时间
            currentTime: '00:00:00',
            // 是否拖拉进度中
            isDragProgress: false,
            // 发生错误
            foundError: false,
            // 是否全屏状态
            fullScreen: false,
            // 当前使用的清晰度
            stream: false,
        };

        // 隐藏控制面板的定时器
        this._hideControlTimer = null;
        // 重试记录
        this._retry = {};
        // 当前播放位置
        this._currentPosition = 0;
        this._seekToPosition = false;

        this._onVideoLoad = this._onVideoLoad.bind(this);
        this._onBuffer = this._onBuffer.bind(this);
        this._onError = this._onError.bind(this);
        this._onEnd = this._onEnd.bind(this);
        this._renderControl = this._renderControl.bind(this);
        this._renderError = this._renderError.bind(this);
        this._toggleControl = this._toggleControl.bind(this);
        this._onProgress = this._onProgress.bind(this);
        this._onTimedMetadata = this._onTimedMetadata.bind(this);
        this._isShowControl = this._isShowControl.bind(this);
        this._isShowPlayPause = this._isShowPlayPause.bind(this);
        this._delayHidePlayButton = this._delayHidePlayButton.bind(this);
        this._handlePanResponderGrant = this._handlePanResponderGrant.bind(this);
        this._handlePanResponderMove = this._handlePanResponderMove.bind(this);
        this._handlePanResponderEnd = this._handlePanResponderEnd.bind(this);
        this._orientationDidChange = this._orientationDidChange.bind(this);
        this._renderVideo = this._renderVideo.bind(this);
        this._loadVideo = this._loadVideo.bind(this);
        this._onBackward = this._onBackward.bind(this);
        this._changeStream = this._changeStream.bind(this);
        this._onPlayBackInfo = this._onPlayBackInfo.bind(this);
        this.pause = this.pause.bind(this);
        this.play = this.play.bind(this);
        this.seek = this.seek.bind(this);
        this.fullScreen = this.fullScreen.bind(this);

        this._progressMaxWidths = {};
    }

    componentWillMount() {
        this._pgResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onResponderTerminationRequest: (evt, gestureState) => true,
            onShouldBlockNativeResponder: (evt, gestureState) => true,
            onPanResponderGrant: this._handlePanResponderGrant,
            onPanResponderMove: this._handlePanResponderMove,
            onPanResponderRelease: this._handlePanResponderEnd,
            onPanResponderTerminate: this._handlePanResponderEnd,
        });

        // 初始化进度控制球的位置
        this._pgOffsetX = -2;
        this._pgPreviousX = this._pgOffsetX;
        this._pgStyles = {
            style: {
                left: this._pgPreviousX,
                bottom: -1.5,
            }
        };


        // 播放器的修正高度
        this.playerStyle = StyleSheet.create({
            fixHeight: { height:210 }
        });

        // 初始化播放器样式
        this._fullScreenStyles = StyleSheet.create({
            fullScreen: {},
        });
    }

    componentDidMount() {
        // 更新进度控制球的样式
        this._updatePGNativeStyles();

        Orientation.addOrientationListener(this._orientationDidChange);

        this.props.video && this._loadVideo(this.props.video);
    }

    componentWillUnmount() {
        Orientation.unlockAllOrientations();
        Orientation.removeOrientationListener(this._orientationDidChange);
    }

    _orientationDidChange(orientation) {
        let progressMaxWidth = 0;
        if (typeof this._progressMaxWidths[orientation] !== 'undefined') {
            progressMaxWidth = this._progressMaxWidths[orientation];
        }
        //Toast.show(orientation + ':' + progressMaxWidth + ':' + this._progressMaxWidths[orientation] + ':' + (typeof this._progressMaxWidths[orientation] !== 'undefined'));

        const win = Dimensions.get('window');
        if (orientation === 'LANDSCAPE') {
            // 生成播放器的全屏样式
            this._fullScreenStyles = {
                fullScreen: {
                    width: Math.max(win.height, win.width),
                    height: Math.min(win.height, win.width),
                }
            };
            if (progressMaxWidth == 0) {
                this._progressMaxWidths[orientation] = progressMaxWidth = this._fullScreenStyles.fullScreen.width - 200;
            }
            this.setState({ fullScreen: true, progressMaxWidth: progressMaxWidth });
        } else {
            // 还原样式
            this._fullScreenStyles = {
                fullScreen: {},
            };
            if (progressMaxWidth == 0) {
                this._progressMaxWidths[orientation] = progressMaxWidth = win.width - 150;
            }
            this.setState({ fullScreen: false, progressMaxWidth: progressMaxWidth });
        }
        //Toast.show(orientation + ':' + progressMaxWidth);
    }

    get screenWidth() {
        const win = Dimensions.get('window');
        if (this.state.fullScreen) {
            return Math.max(win.width, win.height);
        } else {
            return Math.min(win.width, win.height);
        }
    }

    get progressMaxWidth() {
        const win = Dimensions.get('window');
        if (this.state.fullScreen) {
            return Math.max(win.width, win.height) - 200;
        } else {
            return win.width - 150;
        }
    }

    async componentWillReceiveProps(nextProps) {
        if (typeof this.props.video === 'undefined' && typeof nextProps.video === 'undefined') {
            return;
        }
        if (typeof nextProps.video === 'undefined' || typeof nextProps.video.id === 'undefined') {
            return;
        }
        if ((typeof this.props.video === 'undefined' && typeof nextProps.video !== 'undefined')
            || nextProps.video.id !== this.props.video.id
            || nextProps.video.season !== this.props.video.season
            || nextProps.video.episode !== this.props.video.episode) {
            this._loadVideo(nextProps.video);
        }
    }

    play() {
        if (this.player) {
            //this.player.setNativeProps({paused: false});
            this.player.resume();
            this.setState({paused: false});
            this._delayHidePlayButton();
            this.props.onStart && this.props.onStart();
        }
    }

    pause() {
        if (this.player) {
            //this.player.setNativeProps({paused: true});
            this.player.pause();
            this.setState({paused: true});
        }
    }

    seek(seconds) {
        if (this.player) {
            this.player.seekTo(seconds);
            this.play();
        }
    }

    fullScreen() {
        // 锁定为横屏
        Orientation.lockToLandscape();
    }

    unFullScreen() {
        // 还原
        //Orientation.unlockAllOrientations();
        Orientation.lockToPortrait();
    }

    isPaused() {
        return this.state.paused;
    }

    async _loadVideo(video, stream = false) {
        // 如果设置了播放源
        // 直接播放
        if (this.props.source) {
            return this._playStream({ m3u8Url: this.props.source, videoProfile: '本地' });
        }

        loadStreams(video.id, video.season || 0, video.episode || 0, video.platformId || 0)
            .then((result) => {
                if (result.code === 0) {
                    this.streams = result.data;
                    console.log(result);
                    this._playStream(this.streams[0]);
                } else {
                    Toast.show('错误码:' + result.code + '，' + result.message)
                }
            }, (error) => {
                Toast.show('错误码:' + error.code + '。' + error.message);
            });
    }

    _playStream(stream) {
        console.log('_playStream', stream);
        this.player.stop();
        this.player.start({ url: stream.m3u8Url });
        this.setState({stream: stream, paused: false});
    }

    _changeStream(stream) {
        console.log('_changeStream', stream);
        if (stream !== this.state.stream) {
            //this._loadVideo(this.props.video, stream);
            this._playStream(stream);
            this._seekToPosition = true;
        }
    }

    _onBackward() {
        if (this.state.fullScreen && !this.props.forceFullScreen) {
            this.unFullScreen();
        } else {
            this.props.onBackward && this.props.onBackward();
        }
    }

    _handlePanResponderGrant(event, gestureState) {
        this.pause();
        this.setState({
            isDragProgress: true,
        });
        this._pgPreviousX = this._pgStyles.style.left;
    }

    _handlePanResponderMove(event, gestureState) {
        // 屏幕高度
        let screenWidth = this.progressMaxWidth;
        // 计算进度控制球的位置
        this._pgStyles.style.left = this._pgPreviousX + gestureState.dx;
        this._updatePGNativeStyles();
        // 根据实际移动的距离来计算快进的秒数
        const seconds = this.state.duration * (this._pgStyles.style.left / screenWidth);
        this.setState({
            currentTime: util.timeHuman(seconds),
            progressBarWidth: parseInt(seconds / this.state.duration * screenWidth),
        });
    }

    _handlePanResponderEnd(event, gestureState) {
        let screenWidth = this.progressMaxWidth;
        const dx = Math.max(Math.min(gestureState.dx, screenWidth), 0);
        // 根据实际移动的距离来计算快进的秒数
        const seconds = this.state.duration * (this._pgStyles.style.left / screenWidth);
        this.seek(seconds);
        this.setState({
            isDragProgress: false,
        });
    }

    _onPlayBackInfo(event) {
        //console.log('_onPlayBackInfo', event);
        switch (event.playbackState) {
            case RCTIJKPlayer.PlayBackState.IJKMPMoviePlaybackStateInterrupted:
                this._onError(event);
                break;
            case RCTIJKPlayer.PlayBackState.IJKMPMoviePlaybackStatePlaying:
                this._onProgress(event);
                break;
            case RCTIJKPlayer.PlayBackState.IJKMPMoviePlaybackStatePreparing:
                this._onBuffer(event);
            case RCTIJKPlayer.PlayBackState.IJKMPMoviePlaybackStatePrepared:
                this._onVideoLoad(event);
                break;
            case RCTIJKPlayer.PlayBackState.IJKMPMoviePlaybackStatePlayCompleted:
            case RCTIJKPlayer.PlayBackState.IJKMPMoviePlaybackStateStopped:
                this._onEnd(event)
                break;
        }
    }

    _onVideoLoadStart(event) {
        console.log('_onVideoLoadStart', event);
    }

    _onVideoLoad(event) {
        //console.log('_onVideoLoad', event);
        // 重新计算相对高度
        // this.playerStyle = StyleSheet.create({
        //     fixHeight: { height: util.relativeHeight(event.videoWidth, event.videoHeight) }
        // });
        this.setState({
            isVideoLoading: false,
            duration: event.duration,
            durationText: util.timeHuman(event.duration),
        });
    }

    _onProgress(event) {
        let pmw = this.progressMaxWidth;
        if (this._seekToPosition) {
            this._seekToPosition = false;
            if (this._currentPosition > 0) {
                return this.seek(this._currentPosition);
            }
        }

        // 计算进度条
        // 缓冲条宽度
        let bufferedBarWidth = parseInt(event.playableDuration / this.state.duration * pmw);
        // 进度条宽度
        let progressBarWidth = parseInt(event.currentPlaybackTime / this.state.duration * pmw);
        // 修正播放器高度
        // this.playerStyle = StyleSheet.create({
        //     fixHeight: {height: util.relativeHeight(event.videoWidth, event.videoHeight)}
        // });
        this.setState({
            pause: false,
            isStartPlay: true,
            bufferedBarWidth,
            progressBarWidth,
            currentTime: util.timeHuman(event.currentPlaybackTime),
            isVideoLoading: false,
            duration: event.duration,
            durationText: util.timeHuman(event.duration),
        });
        this._currentPosition = event.currentPlaybackTime;
        this._pgStyles.style.left = Math.min(progressBarWidth + this._pgOffsetX, pmw - 8);
        this._updatePGNativeStyles();

        this.props.onProgress && this.props.onProgress(event);
    }

    _onEnd(event) {
        this.player.seekTo(0);
        this.pause();
        this.setState({progressBarWidth: 0});
        this.props.onEnd && this.props.onEnd(event);
    }

    _onError(event, reload = true) {
        console.log('_onError', event, reload);
        if (this.state.stream && reload) {
            // 已选择清晰度，且reload为true（允许重试）
            // 且对应清晰度没有被重试过
            this._loadVideo(this.props.video, this.state.stream);
        } else {
            this.setState({
                foundError: true,
                isVideoLoading: false,
                isVideoBuffering: false,
            });
            this.props.onError && this.props.onError(event);
        }
    }

    _onBuffer(event) {
        this.setState({isVideoBuffering: event.isBuffering});
    }

    _onTimedMetadata(event) {
        console.log('_onTimedMetadata', event);
    }

    _toggleControl() {
        if (!this.state.isVideoLoading && this.state.isStartPlay) {
            if (this.state.showControl || this.state.showPlayPauseButton) {
                this.setState({ showControl: false, showPlayPauseButton: false });
                // 手动隐藏，清除定时器
                if (this._hideControlTimer) {
                    clearTimeout(this._hideControlTimer);
                }
            }
            else {
                this.setState({ showControl: true, showPlayPauseButton: true });
                this._delayHidePlayButton();
            }
        }
    }

    _delayHidePlayButton() {
        this._hideControlTimer = setTimeout(() => { this._toggleControl() }, 5000);
    }

    _isShowControl() {
        // 加载视频中，不显示
        if (this.state.isVideoLoading) {
            return false;
        }

        return this.state.showControl;
    }

    _isShowPlayPause() {
        if (this.state.isVideoLoading) {
            return false;
        }

        return this.state.showPlayPauseButton;
    }

    _updatePGNativeStyles() {
        this.progressHandler && this.progressHandler.setNativeProps(this._pgStyles);
    }


    _renderProgressLayout() {
        return (
            <View style={[styles.backgroundProgressLayout, this._fullScreenStyles.fullScreen]}>
                <Text style={styles.progressTipText}>{this.state.currentTime}</Text>
            </View>
        );
    }

    _renderError() {
        return (
            <TouchableOpacity onPress={this._renderVideo} style={[styles.backgroundProgressLayout, this._fullScreenStyles.fullScreen]}>
                <Text style={styles.progressTipText}>视频加载出错</Text>
            </TouchableOpacity>
        );
    }

    _renderCover() {
        return (
            <View style={styles.backgroundCover}>
                <ImageBackground
                    source={{uri: this.props.video.cover}}
                    style={[styles.cover, this._fullScreenStyles.fullScreen]}
                >
                    <ActivityIndicator style={styles.indicator} />
                </ImageBackground>
            </View>
        );
    }

    _renderLoading() {
        return (
            <View style={[styles.loadingContainer, this._fullScreenStyles.fullScreen]}>
                <ActivityIndicator style={styles.indicator} />
            </View>
        );
    }

    _renderControl() {
        const pmw = this.progressMaxWidth;
        const screenWidth = this.screenWidth;
        // 播放按钮
        const playButton = (
            <TouchableOpacity style={[styles.playButtonContainer]} onPress={this.play}>
                <Image style={styles.playButton} source={require('./imgs/VideoPlayerV2/icon_fullscreen_play.png')} />
            </TouchableOpacity>
        );
        // 暂停
        const pauseButton = (
            <TouchableOpacity style={[styles.playButtonContainer]} onPress={this.pause}>
                <Image style={styles.playButton} source={require('./imgs/VideoPlayerV2/icon_fullscreen_pause.png')} />
            </TouchableOpacity>
        );
        // 后退按钮
        const backButton = (
            <TouchableOpacity style={styles.backButtonContainer} onPress={this._onBackward}>
                <Image
                    source={require('./imgs/VideoPlayerV2/icon_back_arrow_white.png')}
                    style={styles.backButton}
                />
            </TouchableOpacity>
        );
        // 顶部控制条
        const topControlBar = (
            <ImageBackground
                source={require('./imgs/VideoPlayer/screen_gradient_top.png')}
                style={[styles.controlTopBackground, {width: screenWidth}]}
                resizeMode="stretch">
                {backButton}
            </ImageBackground>
        );
        // 全屏按钮
        const zoomIn = (
            <TouchableOpacity style={styles.zoomContainer} onPress={this.fullScreen}>
                <Image
                    source={require('./imgs/VideoPlayerV2/icon_zoom_in.png')}
                    style={styles.zoom} />
            </TouchableOpacity>
        );
        // 取消全屏按钮
        const zoomOut = (
            <TouchableOpacity style={styles.zoomContainer} onPress={this.unFullScreen}>
                <Image
                    source={require('./imgs/VideoPlayerV2/icon_zoom_out.png')}
                    style={styles.zoom} />
            </TouchableOpacity>
        );
        // 进度控制球
        const progressHandler = (
            <View
                ref={(ref) => this.progressHandler = ref}
                style={[styles.progressHandler]}
                {...this._pgResponder.panHandlers}>
                <Image
                    source={require('./imgs/VideoPlayerV2/paly_handle.png')}
                    style={styles.progressHandlerIcon}/>
            </View>
        );
        // 底部控制条
        const bottomControlBar = (
            <ImageBackground
                source={require('./imgs/VideoPlayerV2/screen_gradient_bottom.png')}
                style={[styles.controlBottomBackground, {flexDirection: 'row', width: screenWidth}]}
                resizeMode="stretch">
                <Text style={styles.time}>{this.state.duration ? this.state.currentTime : '00:00'}</Text>
                <View style={{height: 30, marginLeft: 5, marginRight: 5, width: pmw}}>
                    <View style={[styles.progressBarBackground, { width: pmw }]} />
                    <View style={[styles.progressBarBuffered, { width: this.state.bufferedBarWidth }]} />
                    <View style={[styles.progressBar, { width: this.state.progressBarWidth }]} />
                    {this.state.isStartPlay ? progressHandler : null}
                </View>
                <Text style={styles.time}>{this.state.duration ? this.state.durationText : '00:00'}</Text>
                {this._renderStreamSelect()}
                {this.state.fullScreen ? zoomOut : zoomIn}
            </ImageBackground>
        );
        return (
            <TouchableOpacity style={[styles.controlContainer, this._fullScreenStyles.fullScreen]} onPress={this._toggleControl}>
                {this._isShowControl() || this.state.isVideoLoading || this.state.isVideoBuffering ? topControlBar : null}
                {this._isShowPlayPause() && this.isPaused() ? playButton : null}
                {this._isShowPlayPause() && !this.isPaused() ? pauseButton : null}
                {this._isShowControl() ? bottomControlBar : null}
            </TouchableOpacity>
        );
    }

    _renderStreamSelect() {
        if (!this.state.fullScreen) {
            return;
        }

        return (
            <TouchableOpacity onPress={() => this._streamDrawer.show()} style={styles.streamSelectContainer}>
                <Text style={{color: '#fff', fontSize: 10}}>{this.state.stream.videoProfile}</Text>
            </TouchableOpacity>
        );
    }

    _renderVideo() {
        //"https://api.pajiji.com/240P_400K_118834171.mp4"
        return (
            <TouchableOpacity onPress={this._toggleControl}>
                <RCTIJKPlayer
                    onPlayBackInfo={(e) => this._onPlayBackInfo(e)}
                    ref={(ref) => {
                        this.player = ref;
                    }}
                    style={[styles.backgroundVideo, this._fullScreenStyles.fullScreen]}
                />
            </TouchableOpacity>
        );
    }

    _renderActionSheetContent() {
        if (this.props.video && this.streams) {
            return (
                <View style={[styles.actionSheetContentContainer, {height: util.getScreenHeight()}]}>
                    <FlatList
                        data={this.streams}
                        keyExtractor={item => item.videoProfile}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                onPress={() => this._changeStream(item)}
                                style={styles.streamItem2}>
                                <Text style={[styles.streamButton2, item.videoProfile !== this.state.stream.videoProfile ? styles.streamButtonUnselected : null]}>{item.videoProfile}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.streamButtons2}
                        contentContainerStyle={styles.streamListContentContainer}
                    />
                </View>
            );
        }
        return null;
    }

    _render() {
        return (
            <View style={styles.backgroundPlayer} onPress={this._toggleControl}>
                {true ? this._renderVideo() : null}
                {this.state.isVideoLoading ? this._renderCover() : null}
                {this._renderControl()}
                {this.state.isDragProgress ? this._renderProgressLayout() : null}
                {this.state.foundError ? this._renderError() : null}
            </View>
        );
    }


    render() {
        return (
            <View style={styles.container}>
                {this.props.video ? this._render() : this._renderLoading()}
                <XingrenActionSheet
                    ref={(ref) => this._streamDrawer = ref}
                    //title='请选择清晰度'
                    titleStyle={styles.actionSheetTitle}
                    bdStyle={styles.actionSheetBD}
                    content={this._renderActionSheetContent()}
                    slide="right"
                />
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        //flex: 1,
    },
    backgroundCover: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    backgroundPlayer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundVideo: {
        width: util.SCREEN_WIDTH,
        minHeight: 210,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        width: util.SCREEN_WIDTH,
        minHeight: 210,
    },
    cover: {
        minWidth: util.SCREEN_WIDTH,
        minHeight: 210,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButtonContainer: {
    },
    playButton: {
        width: 40,
        height: 40,
    },
    controlContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        width: util.SCREEN_WIDTH,
        minHeight: 210,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlTopBackground: {
        width: util.SCREEN_WIDTH,
        height: 40,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    controlBottomBackground: {
        width: util.SCREEN_WIDTH,
        height: 30,
        position: 'absolute',
        left: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15,
    },
    progressBarBackground: {
        flex: 1,
        height: 3,
        position: 'absolute',
        left: 0,
        bottom: 13.5,
        backgroundColor: '#666',
        opacity: 0.5,
        zIndex: 999,
    },
    progressBarBuffered: {
        height: 3,
        position: 'absolute',
        left: 0,
        bottom: 13.5,
        backgroundColor: '#bbb',
        zIndex: 1000,
    },
    progressBar: {
        height: 3,
        position: 'absolute',
        left: 0,
        bottom: 13.5,
        backgroundColor: '#f75447',
        zIndex: 1001,
    },
    progressHandler: {
        position: 'absolute',
        bottom: -1.5,
        left: -2,
        zIndex: 1002,
        width: 34,
        height: 34,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    progressHandlerIcon: {
        height: 12,
        width: 12,
    },
    time: {
        fontSize: 10,
        color: '#fff',
    },
    zoomContainer: {
        width: 45,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoom: {
        width: 14,
        height: 14,
    },
    indicator: {
        padding: 12,
        backgroundColor: '#0f0f0f',
        opacity: 0.8,
        borderRadius: 6,
    },
    backgroundProgressLayout: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        width: util.SCREEN_WIDTH,
        minHeight: 210,
        zIndex: 999,
    },
    progressTipText: {
        fontSize: 15,
        color: '#fff',
        fontWeight: 'bold',
        padding: 12,
        backgroundColor: '#0f0f0f',
        borderRadius: 6,
    },
    backButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backButton: {
        width: 8,
        height: 14,
    },
    actionSheetTitle: {
        padding: 6,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#4c4c4c'
    },
    actionSheetBD: {
        backgroundColor: '#00000080',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionSheetContentContainer: {
        flex: 1,
        height: util.getScreenHeight(),
        alignItems: 'center',
        justifyContent: 'center',
    },
    streamButtons2: {
        flex: 1,
    },
    streamItem2: {
        width: 150,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    streamListContentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    streamButton2: {
        fontSize: 15,
        color: '#fff',
    },
    streamButtonUnselected: {
        color: '#808080',
    },
    streamSelectContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 15,
    },
});