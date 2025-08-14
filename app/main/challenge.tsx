import SectionHeader from '@/components/evault-components/section-header';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'savings' | 'spending' | 'streak' | 'category';
    targetAmount?: number;
    currentAmount: number;
    progress: number;
    duration: string;
    reward: string;
    isActive: boolean;
    isCompleted: boolean;
    icon: string;
    color: string;
    startDate: string;
    endDate: string;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    unlockedDate?: string;
    isUnlocked: boolean;
}

const ChallengesPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'achievements'>('active');
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newChallenge, setNewChallenge] = useState({
        title: '',
        targetAmount: '',
        duration: '30',
        type: 'savings' as Challenge['type'],
    });

    const activeChallenges: Challenge[] = [
        {
            id: '1',
            title: 'Save $500 this month',
            description: 'Build your emergency fund',
            type: 'savings',
            targetAmount: 500,
            currentAmount: 320,
            progress: 64,
            duration: '30 days',
            reward: '$5 bonus',
            isActive: true,
            isCompleted: false,
            icon: 'wallet',
            color: '#4285F4',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
        },
        {
            id: '2',
            title: 'Limit dining out to $100',
            description: 'Control your food expenses',
            type: 'spending',
            targetAmount: 100,
            currentAmount: 75,
            progress: 75,
            duration: '30 days',
            reward: '$3 cashback',
            isActive: true,
            isCompleted: false,
            icon: 'restaurant',
            color: '#FF6B6B',
            startDate: '2024-01-01',
            endDate: '2024-01-31',
        },
        {
            id: '3',
            title: '7-day spending tracking',
            description: 'Log every transaction',
            type: 'streak',
            currentAmount: 5,
            progress: 71,
            duration: '7 days',
            reward: 'Premium features',
            isActive: true,
            isCompleted: false,
            icon: 'calendar',
            color: '#00C851',
            startDate: '2024-01-01',
            endDate: '2024-01-07',
        },
    ];

    const completedChallenges: Challenge[] = [
        {
            id: '4',
            title: 'Save $300 in December',
            description: 'Holiday savings goal',
            type: 'savings',
            targetAmount: 300,
            currentAmount: 300,
            progress: 100,
            duration: '31 days',
            reward: '$2 bonus',
            isActive: false,
            isCompleted: true,
            icon: 'gift',
            color: '#FFD700',
            startDate: '2023-12-01',
            endDate: '2023-12-31',
        },
        {
            id: '5',
            title: 'No coffee shop visits',
            description: '30-day coffee challenge',
            type: 'category',
            currentAmount: 30,
            progress: 100,
            duration: '30 days',
            reward: '$10 cashback',
            isActive: false,
            isCompleted: true,
            icon: 'cafe',
            color: '#8B4513',
            startDate: '2023-11-01',
            endDate: '2023-11-30',
        },
    ];

    const achievements: Achievement[] = [
        {
            id: '1',
            title: 'First Challenge',
            description: 'Complete your first savings challenge',
            icon: 'trophy',
            color: '#FFD700',
            unlockedDate: '2023-11-15',
            isUnlocked: true,
        },
        {
            id: '2',
            title: 'Savings Streak',
            description: 'Save money for 7 consecutive days',
            icon: 'flame',
            color: '#FF6B6B',
            unlockedDate: '2023-12-01',
            isUnlocked: true,
        },
        {
            id: '3',
            title: 'Budget Master',
            description: 'Complete 5 spending challenges',
            icon: 'medal',
            color: '#4285F4',
            isUnlocked: false,
        },
        {
            id: '4',
            title: 'Consistency King',
            description: 'Track expenses for 30 days straight',
            icon: 'star',
            color: '#00C851',
            isUnlocked: false,
        },
    ];

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const handleCreateChallenge = async () => {
        if (!newChallenge.title.trim()) {
            Alert.alert('Error', 'Please enter a challenge title');
            return;
        }

        if (newChallenge.type !== 'streak' && (!newChallenge.targetAmount || parseFloat(newChallenge.targetAmount) <= 0)) {
            Alert.alert('Error', 'Please enter a valid target amount');
            return;
        }

        try {
            setLoading(true);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            Alert.alert('Success', 'Challenge created successfully!');
            setCreateModalVisible(false);
            setNewChallenge({
                title: '',
                targetAmount: '',
                duration: '30',
                type: 'savings',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to create challenge. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const CardContainer = ({ children }: { children: React.ReactNode }) => (
        <View style={styles.cardContainer}>
            {children}
        </View>
    );

    const ProgressBar = ({ progress, color }: { progress: number; color: string }) => (
        <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${Math.min(progress, 100)}%`, backgroundColor: color }
                    ]}
                />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
    );

    const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
        <CardContainer>
            <View style={styles.challengeHeader}>
                <View style={[styles.challengeIcon, { backgroundColor: `${challenge.color}20` }]}>
                    <Ionicons name={challenge.icon as any} size={24} color={challenge.color} />
                </View>
                <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDescription}>{challenge.description}</Text>
                </View>
                <View style={styles.challengeStatus}>
                    {challenge.isCompleted ? (
                        <View style={[styles.statusBadge, { backgroundColor: '#00C851' }]}>
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        </View>
                    ) : (
                        <View style={[styles.statusBadge, { backgroundColor: challenge.color }]}>
                            <Text style={styles.statusText}>Active</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.challengeProgress}>
                <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>
                        {challenge.type === 'savings' ? 'Saved' :
                            challenge.type === 'spending' ? 'Spent' : 'Days completed'}
                    </Text>
                    <Text style={styles.progressValue}>
                        {challenge.targetAmount
                            ? `${formatCurrency(challenge.currentAmount)} / ${formatCurrency(challenge.targetAmount)}`
                            : `${challenge.currentAmount} days`
                        }
                    </Text>
                </View>
                <ProgressBar progress={challenge.progress} color={challenge.color} />
            </View>

            <View style={styles.challengeFooter}>
                <View style={styles.footerItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.footerText}>{challenge.duration}</Text>
                </View>
                <View style={styles.footerItem}>
                    <Ionicons name="gift-outline" size={16} color="#666" />
                    <Text style={styles.footerText}>{challenge.reward}</Text>
                </View>
                <Text style={styles.dateRange}>
                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                </Text>
            </View>
        </CardContainer>
    );

    const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
        <CardContainer>
            <View style={styles.achievementHeader}>
                <View style={[
                    styles.achievementIcon,
                    {
                        backgroundColor: achievement.isUnlocked ? `${achievement.color}20` : '#F5F5F5',
                        opacity: achievement.isUnlocked ? 1 : 0.6
                    }
                ]}>
                    <Ionicons
                        name={achievement.icon as any}
                        size={28}
                        color={achievement.isUnlocked ? achievement.color : '#CCC'}
                    />
                </View>
                <View style={styles.achievementInfo}>
                    <Text style={[
                        styles.achievementTitle,
                        !achievement.isUnlocked && styles.lockedText
                    ]}>
                        {achievement.title}
                    </Text>
                    <Text style={[
                        styles.achievementDescription,
                        !achievement.isUnlocked && styles.lockedText
                    ]}>
                        {achievement.description}
                    </Text>
                    {achievement.unlockedDate && (
                        <Text style={styles.unlockedDate}>
                            Unlocked {formatDate(achievement.unlockedDate)}
                        </Text>
                    )}
                </View>
                {achievement.isUnlocked && (
                    <View style={styles.unlockedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#00C851" />
                    </View>
                )}
            </View>
        </CardContainer>
    );

    const TabButton = ({ id, title, isActive }: { id: string; title: string; isActive: boolean }) => (
        <TouchableOpacity
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => setActiveTab(id as any)}
        >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
        </TouchableOpacity>
    );

    const StatsOverview = () => (
        <CardContainer>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{activeChallenges.length}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{completedChallenges.length}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{achievements.filter(a => a.isUnlocked).length}</Text>
                    <Text style={styles.statLabel}>Achievements</Text>
                </View>
            </View>
        </CardContainer>
    );

    const CreateChallengeModal = () => (
        <Modal
            visible={createModalVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        onPress={() => setCreateModalVisible(false)}
                        style={styles.modalButton}
                    >
                        <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Create Challenge</Text>
                    <TouchableOpacity
                        onPress={handleCreateChallenge}
                        style={styles.modalButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#4285F4" />
                        ) : (
                            <Text style={styles.modalSaveText}>Create</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Challenge Title</Text>
                        <TextInput
                            style={styles.textInput}
                            value={newChallenge.title}
                            onChangeText={(text) => setNewChallenge(prev => ({ ...prev, title: text }))}
                            placeholder="e.g., Save $200 this month"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Challenge Type</Text>
                        <View style={styles.typeButtons}>
                            {[
                                { id: 'savings', label: 'Savings', icon: 'wallet' },
                                { id: 'spending', label: 'Spending', icon: 'card' },
                                { id: 'streak', label: 'Habit', icon: 'calendar' },
                            ].map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.typeButton,
                                        newChallenge.type === type.id && styles.activeTypeButton
                                    ]}
                                    onPress={() => setNewChallenge(prev => ({ ...prev, type: type.id as any }))}
                                >
                                    <Ionicons
                                        name={type.icon as any}
                                        size={20}
                                        color={newChallenge.type === type.id ? '#4285F4' : '#666'}
                                    />
                                    <Text style={[
                                        styles.typeButtonText,
                                        newChallenge.type === type.id && styles.activeTypeButtonText
                                    ]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {newChallenge.type !== 'streak' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Target Amount ($)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={newChallenge.targetAmount}
                                onChangeText={(text) => setNewChallenge(prev => ({ ...prev, targetAmount: text }))}
                                placeholder="Enter target amount"
                                keyboardType="numeric"
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Duration (days)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={newChallenge.duration}
                            onChangeText={(text) => setNewChallenge(prev => ({ ...prev, duration: text }))}
                            placeholder="Enter duration in days"
                            keyboardType="numeric"
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'active':
                return (
                    <>
                        {activeChallenges.map((challenge) => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))}
                    </>
                );
            case 'completed':
                return (
                    <>
                        {completedChallenges.map((challenge) => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))}
                    </>
                );
            case 'achievements':
                return (
                    <>
                        {achievements.map((achievement) => (
                            <AchievementCard key={achievement.id} achievement={achievement} />
                        ))}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <StatsOverview />

                <View style={styles.section}>
                    <SectionHeader
                        title="Challenges"
                        onSeeAllPress={() => setCreateModalVisible(true)}
                        seeAllText="Create New"
                    />

                    <View style={styles.tabContainer}>
                        <TabButton id="active" title="Active" isActive={activeTab === 'active'} />
                        <TabButton id="completed" title="Completed" isActive={activeTab === 'completed'} />
                        <TabButton id="achievements" title="Achievements" isActive={activeTab === 'achievements'} />
                    </View>

                    <View style={styles.contentContainer}>
                        {renderContent()}
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            <CreateChallengeModal />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        marginBottom: 32,
    },
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeTabButton: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeTabText: {
        color: '#1A1A1A',
        fontWeight: '600',
    },
    contentContainer: {
        gap: 16,
    },
    challengeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    challengeIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    challengeInfo: {
        flex: 1,
    },
    challengeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    challengeDescription: {
        fontSize: 14,
        color: '#666',
    },
    challengeStatus: {
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    challengeProgress: {
        marginBottom: 16,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: '#666',
    },
    progressValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 4,
        marginRight: 12,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        minWidth: 35,
        textAlign: 'right',
    },
    challengeFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    dateRange: {
        fontSize: 12,
        color: '#666',
    },
    achievementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    achievementIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    achievementDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    lockedText: {
        color: '#CCC',
    },
    unlockedDate: {
        fontSize: 12,
        color: '#00C851',
        fontWeight: '500',
    },
    unlockedBadge: {
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalButton: {
        padding: 4,
    },
    modalCancelText: {
        fontSize: 16,
        color: '#666',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    modalSaveText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4285F4',
    },
    modalContent: {
        flex: 1,
    },
    modalScrollContent: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1A1A1A',
    },
    typeButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    activeTypeButton: {
        borderColor: '#4285F4',
        backgroundColor: '#F0F7FF',
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginTop: 4,
    },
    activeTypeButtonText: {
        color: '#4285F4',
    },
    bottomSpacing: {
        height: 20,
    },
});

export default ChallengesPage;