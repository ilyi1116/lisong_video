
import React from 'react';
import {
    View ,
    Text,
    StyleSheet
} from 'react-native';

export default class chapter extends React.Component {
    constructor (props){
        super(props);
    }

    render (){
        return (
            <View style={[styles.container]}>
                <Text style={{fontSize:30,color:'#fff'}}>Hello Charpter</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        alignItems : 'center',
        justifyContent : 'center',
        backgroundColor : '#730'
    }
})
