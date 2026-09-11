import { useResponsive } from '../hooks/useResponsive';
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ImageBackground,
  ScrollView,
  TextInput,
} from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import places from '../data/places.json';
import { assets } from '../data/assets';
import { styles as s, colors } from '../theme';
import { Header, Page, Button, Back, Empty } from '../components/UI';
import { directions, openLink } from '../utils/links';
function LocationPlot({
  onSelect,
  zoom = 1,
}: {
  onSelect: (id: string) => void;
  zoom?: number;
}) {
  return (
    <View
      style={{
        height: 240,
        backgroundColor: '#E3E9DC',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`${200 - 200 / zoom} ${120 - 120 / zoom} ${400 / zoom} ${
          240 / zoom
        }`}
      >
        <Path
          d="M180 0Q140 70 235 120T280 240"
          stroke="#AECEDB"
          strokeWidth={22}
          fill="none"
        />
        <Path
          d="M0 90H400M250 0V240M0 180H400M110 0V240"
          stroke="#FAF8EF"
          strokeWidth={6}
        />
        {places.map(place => {
          const x = 25 + ((place.longitude + 114.36) / 0.32) * 350;
          const y = 215 - ((place.latitude - 50.91) / 0.12) * 180;
          return (
            <Circle
              key={place.id}
              cx={x}
              cy={y}
              r={7}
              fill={colors.blue}
              stroke="white"
              strokeWidth={2}
              onPress={() => onSelect(place.id)}
            />
          );
        })}
        <SvgText x={260} y={38} fill="#697A63" fontSize={13}>
          CALGARY
        </SvgText>
        <SvgText x={20} y={225} fill="#697A63" fontSize={12}>
          TSUUT’INA NATION
        </SvgText>
      </Svg>
      <Text
        style={{
          position: 'absolute',
          left: 12,
          bottom: 10,
          backgroundColor: '#ffffffdb',
          padding: 6,
          borderRadius: 8,
          fontSize: 10,
          color: colors.ink,
        }}
      >
        Location overview · tap a marker
      </Text>
    </View>
  );
}
export function Explore() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  return (
    <View style={s.screen}>
      <Header title="Tours & Nearby" eyebrow="AROUND THE RESORT" />
      <Page>
        <LocationPlot onSelect={id => navigation.navigate('Place', { id })} />
        <Button
          title="Explore locations"
          secondary
          onPress={() => navigation.navigate('Map')}
        />
        {['Cultural Experiences', 'Nearby & Community'].map(
          (category, index) => (
            <View key={category} style={{ gap: 14 }}>
              <Text style={s.section}>{category}</Text>
              {places
                .slice(index === 0 ? 0 : 3, index === 0 ? 3 : undefined)
                .map(place => (
                  <Pressable
                    key={place.id}
                    onPress={() =>
                      navigation.navigate('Place', { id: place.id })
                    }
                    style={[s.card, { padding: 12, gap: 12 }]}
                  >
                    <View style={s.row}>
                      {assets[place.title] && (
                        <Image
                          source={assets[place.title]}
                          style={{ width: 100, height: 125, borderRadius: 12 }}
                        />
                      )}
                      <View style={{ flex: 1, gap: 9 }}>
                        <Text style={s.tag}>{place.tag}</Text>
                        <Text style={{ color: colors.ink, fontSize: 17 }}>
                          {place.title}
                        </Text>
                        <Text style={s.muted} numberOfLines={2}>
                          {place.body.split('\n')[0]}
                        </Text>
                      </View>
                    </View>
                    <Button
                      secondary
                      title="View Details"
                      onPress={() =>
                        navigation.navigate('Place', { id: place.id })
                      }
                    />
                  </Pressable>
                ))}
            </View>
          ),
        )}
      </Page>
    </View>
  );
}
export function Place({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Place'>) {
  const { heroHeight, spacing } = useResponsive();
  const place = places.find(item => item.id === route.params.id)!;
  const [body, highlights] = place.body.split('Highlights');
  return (
    <View style={s.screen}>
      <ScrollView>
        {assets[place.title] ? (
          <ImageBackground
            source={assets[place.title]}
            style={{ height: heroHeight }}
          >
            <Back onPress={() => navigation.goBack()} />
          </ImageBackground>
        ) : (
          <Back onPress={() => navigation.goBack()} />
        )}
        <View style={[s.content, { padding: spacing }]}>
          <Text style={s.tag}>{place.tag}</Text>
          <Text style={s.title}>{place.title}</Text>
          {body
            .split('\n')
            .filter(Boolean)
            .map((line, i) => (
              <Text key={i} style={s.body}>
                {line}
              </Text>
            ))}
          <Text style={s.section}>Highlights</Text>
          <View style={s.card}>
            {highlights
              ?.trim()
              .split('\n')
              .filter(Boolean)
              .map(line => (
                <Text
                  key={line}
                  style={[
                    s.body,
                    {
                      padding: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  • {line.trim()}
                </Text>
              ))}
          </View>
          <Button
            title="Get directions"
            onPress={() =>
              directions(place.latitude, place.longitude, place.title)
            }
          />
          {place.tag === 'TOUR' && (
            <Button
              secondary
              title="Inquire about this tour"
              onPress={() =>
                openLink(
                  `mailto:bustours@greyeagle.ca?subject=${encodeURIComponent(
                    place.title,
                  )}`,
                )
              }
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
export function MapScreen({
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Map'>) {
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(1);
  const filtered = places.filter(place =>
    place.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <View style={s.screen}>
      <Back
        title="Places near the resort"
        onPress={() => navigation.goBack()}
      />
      <Page>
        <TextInput
          accessibilityLabel="Search places"
          style={s.input}
          placeholder="Search places near the resort"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
        <LocationPlot
          zoom={zoom}
          onSelect={id => navigation.navigate('Place', { id })}
        />
        <View style={s.row}>
          <Button
            title="−"
            secondary
            onPress={() => setZoom(Math.max(1, zoom - 0.5))}
          />
          <Button
            title="+"
            secondary
            onPress={() => setZoom(Math.min(3, zoom + 0.5))}
          />
          <Text style={s.muted}>{zoom}×</Text>
        </View>
        <Text style={s.section}>{filtered.length} places</Text>
        {filtered.map(place => (
          <View key={place.id} style={[s.card, { padding: 15, gap: 12 }]}>
            <Pressable
              onPress={() => navigation.navigate('Place', { id: place.id })}
            >
              <Text style={s.heading}>{place.title}</Text>
            </Pressable>
            <Button
              secondary
              title="Route"
              onPress={() =>
                directions(place.latitude, place.longitude, place.title)
              }
            />
          </View>
        ))}
        {filtered.length === 0 && (
          <Empty title="No places found" body="Try another place name." />
        )}
      </Page>
    </View>
  );
}
