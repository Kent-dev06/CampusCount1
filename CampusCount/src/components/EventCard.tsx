import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { EventItem } from '../data/events';

type EventCardProps = {
  item: EventItem;
  onPress: () => void;
  button?: string;
  isBookmarked?: boolean;
  onBookmark?: () => void;
};

const ink = '#18251F';
const green = '#176B4A';
const muted = '#77827C';

export default function EventCard({
  item,
  onPress,
  button = 'View details',
  isBookmarked = false,
  onBookmark,
}: EventCardProps) {
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventTop}>
        <View
          style={[
            styles.dateBox,
            { backgroundColor: item.color },
          ]}
        >
          <Text style={styles.dateText}>
            {item.date.split(' ')[0]}
          </Text>

          <Text style={styles.dateDay}>
            {item.date.split(' ')[1]}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>
            {item.title}
          </Text>

          <Text style={styles.eventMeta}>
            {item.time} · {item.place}
          </Text>
        </View>

        {onBookmark && (
          <TouchableOpacity onPress={onBookmark} style={styles.bookmarkBtn}>
            <Text style={{ fontSize: 18, color: isBookmarked ? '#E5A847' : '#98A29C' }}>
              {isBookmarked ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.eventBottom}>
        <Text style={styles.tag}>
          {item.kind}
        </Text>

        <TouchableOpacity onPress={onPress}>
          <Text style={styles.link}>
            {button} →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFEB',
    marginBottom: 10,
  },

  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  dateBox: {
    width: 45,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateText: {
    color: ink,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  dateDay: {
    color: ink,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 1,
  },

  eventTitle: {
    color: ink,
    fontSize: 13,
    fontWeight: '800',
  },

  eventMeta: {
    color: muted,
    fontSize: 10,
    marginTop: 5,
  },

  bookmarkBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eventBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
     paddingTop: 11,
    borderTopWidth: 1,
    borderColor: '#F0F1EF',
  },

  tag: {
    color: green,
    backgroundColor: '#E9F4EC',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  link: {
    color: green,
    fontWeight: '800',
    fontSize: 11,
  },
});