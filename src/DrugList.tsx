import React, {useEffect, useRef, useState} from 'react';
import {useNavigation} from 'react-navigation-hooks';
import {SafeAreaView} from 'react-navigation';

import {
  TextInput,
  StatusBar,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  getDataFromStorage,
  getDataFromGithub,
  saveDataToStorage,
  Drug,
} from './db';

const Item: React.FC<{drug: Drug}> = ({drug}) => {
  /**
   * Navigation
   */
  const {navigate} = useNavigation();

  //
  return (
    <TouchableOpacity
      onPress={() => {
        navigate('DrugItem', {drug});
      }}>
      <View
        style={{
          padding: 10,
          borderBottomColor: 'silver',
          borderBottomWidth: 1,
          borderLeftColor: drug.label,
          borderLeftWidth: 3,
        }}>
        <Text style={{fontSize: 14}}>{drug.title}</Text>
        {drug.other && drug.other?.length > 0 && (
          <Text style={{color: 'gray'}}>{drug.other}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 *
 */
const DrugList = () => {
  // drugs sourse
  const homeopathyUrl = `https://fuflomycin.github.io/fuflomycin/homeopathy.json`;
  const rspUrl = 'https://fuflomycin.github.io/fuflomycin/rsp.json';

  // all drugs
  const [drugs, setDrugs] = useState<Drug[]>([]);

  // prompt string
  const [prompt, setPrompt] = useState('');

  // filtered drugs results
  const [results, setResults] = useState<Drug[]>([]);

  // loading
  const [loading, setLoading] = useState(true);

  //
  const {navigate} = useNavigation();

  /**
   *
   */
  const searchRef = useRef(null);

  /* useEffect(() => {
    searchRef.current.focus();
  }, []); */

  /**
   * Load all drugs from github
   */
  useEffect(() => {
    console.log('First start');

    (async () => {
      //
      const storedDrugs = await getDataFromStorage();
      console.log('Stored drugs', storedDrugs);
      if (storedDrugs) {
        // drugs found in async storage
        setDrugs([...storedDrugs]);
        setResults([...storedDrugs]);
        // setPrompt('');
        setLoading(false);
      }

      const loadedDrugs = await getDataFromGithub();
      console.log('Loaded drugs', loadedDrugs);
      if (loadedDrugs) {
        setDrugs([...loadedDrugs]);
        if (prompt === '') {
          setResults([...loadedDrugs]);
          setLoading(false);
        }
        await saveDataToStorage(loadedDrugs);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar backgroundColor="#ff5959" barStyle="light-content" />
      <View
        style={{
          height: 50,
          backgroundColor: '#ff5959',
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {loading ? (
          <ActivityIndicator size={30} color="#fff" />
        ) : (
          <View>
            <Icon name="magnify" size={24} color="#fff" />
            <Text style={{color: '#fff', fontSize: 10}}>{results.length}</Text>
          </View>
        )}

        <TextInput
          style={{
            borderColor: '#ef4949',
            borderWidth: 1,
            flex: 1,
            backgroundColor: '#fff',
            marginLeft: 10,
            marginRight: 10,
            borderRadius: 3,
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 3,
            paddingBottom: 3,
          }}
          value={prompt}
          onChangeText={newPrompt => {
            const p = newPrompt.toLocaleUpperCase();
            setResults([...drugs.filter(i => i.index.includes(p))]);
            setPrompt(newPrompt);
          }}
        />
        <TouchableOpacity
          onPress={() => {
            navigate('DrugInfo');
          }}>
          <Icon name="information-outline" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <View>
        <FlatList
          data={results}
          renderItem={({item}) => <Item drug={item} />}
          keyExtractor={item => item.id}
        />
      </View>
    </SafeAreaView>
  );
};

export default DrugList;
