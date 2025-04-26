import { StyleSheet, Platform, Dimensions } from 'react-native';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');

const GrowthStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header styles matched with HomeStyles
  headerContainer: {
    width: '100%',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerGradient: {
    width: '100%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  logoText: {
    fontFamily: 'Shrikhand',
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
    position: 'relative',
    padding: 5,
  },
  backButton: {
    padding: 5,
  },
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 15,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  // Tab styles matched with HomeStyles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 5,
  },
  activeTabText: {
    color: colors.primary,
  },
  // Existing Growth screen styles
  content: {
    flex: 1,
    padding: 20,
  },
  dailySummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dailySummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  todayEntryPreview: {
    paddingVertical: 4,
  },
  todayEntryText: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
  },
  growthDataPreview: {
    flexDirection: 'row',
    marginTop: 8,
  },
  growthPreviewText: {
    fontSize: 13,
    color: colors.textDark,
    marginRight: 16,
    fontWeight: '500',
  },
  addTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
  },
  addTodayButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthNavButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    borderRadius: 30,
    marginBottom: 16,
    padding: 4,
  },
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    paddingBottom: 40,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  milestonesContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  comingSoonText: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  chartPlaceholder: {
    width: width - 40,
    height: 200,
    marginVertical: 20,
  },
  milestonePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textDark,
    marginTop: 16,
  },
  loader: {
    marginTop: 40,
  },
});

export default GrowthStyles;