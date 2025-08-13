import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SectionHeaderProps {
  title: string;
  showSeeAll?: boolean;
  seeAllText?: string;
  onSeeAllPress?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title,
  showSeeAll = true,
  seeAllText = "See All",
  onSeeAllPress
}) => {
  const handleSeeAllPress = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      console.log(`See all pressed for: ${title}`);
    }
  };

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showSeeAll && (
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text style={styles.seeAllText}>{seeAllText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#343A40',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
  },
});

export default SectionHeader;