import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';

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

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF3E0', // soft light orange background
    minHeight: '100%',
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemContainer: {
    marginBottom: 14,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFD54F', // soft yellow card
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  chevron: {
    fontSize: 18,
    color: '#444',
  },
  itemBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 6,
    backgroundColor: '#FFF9C4', // lighter yellow for detail
  },
  itemDetail: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 10,
  },
  detailTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFECB3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  detailTagText: {
    color: '#5a3e00',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default LawRegulation;