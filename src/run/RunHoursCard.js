import React from 'react';
import {View, StyleSheet,Text} from 'react-native';
import * as Animatable from 'react-native-animatable';
const RunHoursCard = ({date,ebR,ebK,dgR,dgK,btR,btK,tR,tK,client,mode}) => {
    return (
        <View style={[styles.insideContainer,{backgroundColor:mode?'#3f3f3f':'white'}]}>
                <View style={[styles.total,{backgroundColor:mode?'#232323':'#0a478f'}]}>
                    <Animatable.Text style={styles.headerText} animation="fadeIn" iterationCount="infinite">{date}</Animatable.Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
                            <Text style={[styles.totalText, { color: '#53cf17' }]}>EB(Run Hrs)</Text>
                            <Animatable.Text style={[styles.totalText, { color: '#53cf17' }, { marginLeft: 2, fontFamily: 'digital-7 (italic)',fontSize: 18 },]} animation="fadeIn" iterationCount="infinite">{ebR}</Animatable.Text>
                        </View>
                        {client != 'CREST DIGITEL' && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[styles.totalText, { color: '#eb003d' }]}>DG(Run Hrs)</Text>
                            <Animatable.Text style={[styles.totalText, { color: '#eb003d' }, { marginLeft: 2, fontFamily: 'digital-7 (italic)',fontSize: 18 }]} animation="fadeIn" iterationCount="infinite">{dgR}</Animatable.Text>
                        </View>)}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[styles.totalText, { color: '#ffc107' }]}>BT(Run Hrs)</Text>
                            <Animatable.Text style={[styles.totalText, { color: '#ffc107' }, { marginLeft: 2, fontFamily: 'digital-7 (italic)',fontSize: 18 }]} animation="fadeIn" iterationCount="infinite">{btR}</Animatable.Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[styles.totalText, { color:mode?'#1eb3eb':'#0a478f' }]}>Total(Run Hrs)</Text>
                            <Animatable.Text style={[styles.totalText, { color:mode?'#1eb3eb':'#0a478f' }, { marginLeft: 2, fontFamily: 'digital-7 (italic)',fontSize: 18 }]} animation="fadeIn" iterationCount="infinite">{tR}</Animatable.Text>
                        </View>
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' ,alignItems:'center'}}>
                            <Text style={[styles.totalText, { color: '#53cf17' }]}>EB(Kwh)</Text>
                            <Text style={[styles.totalText, { color: '#53cf17' }, { marginLeft: 2}]}>{ebK}</Text>
                        </View>
                        {client != 'CREST DIGITEL' && (<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[styles.totalText, { color: '#eb003d' }]}>DG(Kwh)</Text>
                            <Text style={[styles.totalText, { color: '#eb003d' }, { marginLeft: 2}]}>{dgK}</Text>
                        </View>)}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[styles.totalText, { color: '#ffc107' }]}>BT(Kwh)</Text>
                            <Text style={[styles.totalText, { color: '#ffc107' }, { marginLeft: 2 }]}>{btK}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={[styles.totalText, { color:mode?'#1eb3eb' :'#0a478f' }]}>Total(Kwh)</Text>
                            <Text style={[styles.totalText, { color:mode?'#1eb3eb':'#0a478f' }, { marginLeft: 2}]}>{tK}</Text>
                        </View>

                    </View>
                </View>

            </View>
    );
}

const styles = StyleSheet.create({
    headerText: {
        fontFamily: 'digital-7 (italic)',
        color: 'white',
        alignItems: 'flex-start',
        marginLeft: 12,
        fontSize: 20,
        paddingTop:4,
        paddingBottom:4
    },
    total: {
        backgroundColor: '#0a478f',
        padding: 6,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    insideContainer: {
        marginLeft: 14,
        marginRight: 14,
        marginTop: 6,
        backgroundColor: 'white',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    totalText: {
        fontFamily: 'AndadaPro-Regular',
        color: 'green',
        alignItems: 'flex-start',
        marginLeft: 12,
        marginRight: 12,
        fontSize: 15
    },     
})

export default RunHoursCard;
