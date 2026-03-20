import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale } from '../../utils/responsive';

const rulesData = [
  {
    id: 'r1',
    title: 'Rule 1: Property Listing Accuracy',
    detail:
      'All listings must include accurate information. Misrepresentation of property size, location, or features is prohibited and may result in removal from the platform.',
  },
  {
    id: 'r2',
    title: 'Rule 2: Photos & Media',
    detail:
      'Photos should be clear and represent the actual condition of the property. Avoid using misleading or edited photos that alter the perception of the property.',
  },
  {
    id: 'r3',
    title: 'Rule 3: Fair Pricing',
    detail:
      'Sellers must set a fair and honest asking price. Artificially inflated prices or price baiting to attract users is not allowed.',
  },
  {
    id: 'r4',
    title: 'Rule 4: Communication & Contact',
    detail:
      'Respectful and timely communication with buyers and agents is expected. Do not share private contact information in public listing fields.',
  },
  {
    id: 'r5',
    title: 'Rule 5: Legal Compliance',
    detail:
      'All transactions and listings must comply with local laws and regulations. Users are responsible for confirming legal requirements in their jurisdiction.',
  },
  {
    id: 'r6',
    title: 'Rule 6: No Discrimination',
    detail:
      "All users must follow nondiscrimination policies. Listings or communications that exclude or discriminate against any group are forbidden.",
  },
];

const RuleItem = ({ item, expanded, onPress }) => {
  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.itemHeader}
      >
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.itemBody}>
          <Text style={styles.itemDetail}>{item.detail}</Text>
          <View style={styles.detailTag}>
            <Text style={styles.detailTagText}>Details</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const LawRegulation = () => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF3E0' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Rules & Regulations</Text>
        <Text style={styles.subheader}>
          Please read these rules before listing or contacting sellers.
        </Text>

        {rulesData.map((r) => (
          <RuleItem
            key={r.id}
            item={r}
            expanded={openId === r.id}
            onPress={() => toggle(r.id)}
          />
        ))}

        <View style={{ height: verticalScale(40) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: scale(20),
    paddingTop: verticalScale(20),
    backgroundColor: '#FFF3E0', // soft light orange background
    minHeight: '100%',
  },
  header: {
    fontSize: scale(26),
    fontWeight: '700',
    color: '#222',
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  subheader: {
    fontSize: scale(14),
    color: '#555',
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  itemContainer: {
    marginBottom: verticalScale(14),
    borderRadius: scale(12),
    overflow: 'hidden',
    backgroundColor: '#FFD54F', // soft yellow card
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
  },
  itemTitle: {
    fontSize: scale(16),
    color: '#333',
    flex: 1,
    marginRight: scale(8),
  },
  chevron: {
    fontSize: scale(18),
    color: '#444',
  },
  itemBody: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(16),
    paddingTop: verticalScale(6),
    backgroundColor: '#FFF9C4', // lighter yellow for detail
  },
  itemDetail: {
    fontSize: scale(14),
    color: '#444',
    lineHeight: verticalScale(20),
    marginBottom: verticalScale(10),
  },
  detailTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFECB3',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    borderRadius: scale(6),
  },
  detailTagText: {
    color: '#5a3e00',
    fontWeight: '600',
    fontSize: scale(12),
  },
});

export default LawRegulation;