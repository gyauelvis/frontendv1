import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { apiClient, AnalyticsData, Transaction, FraudAlert } from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  // Analytics Data
  analytics: AnalyticsData | null;
  analyticsLoading: boolean;
  analyticsPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  setAnalyticsPeriod: (period: 'daily' | 'weekly' | 'monthly' | 'quarterly') => void;
  refreshAnalytics: () => Promise<void>;
  
  // Transactions
  transactions: Transaction[];
  transactionsLoading: boolean;
  refreshTransactions: () => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  hasMoreTransactions: boolean;
  
  // Fraud Alerts
  fraudAlerts: FraudAlert[];
  fraudAlertsLoading: boolean;
  refreshFraudAlerts: () => Promise<void>;
  
  // Insights
  insights: {
    spendingPatterns: string[];
    recommendations: string[];
    anomalies: string[];
  } | null;
  insightsLoading: boolean;
  refreshInsights: () => Promise<void>;
  
  // Risk Score
  riskScore: { score: number; factors: string[] } | null;
  riskScoreLoading: boolean;
  refreshRiskScore: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('weekly');
  
  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  // Fraud alerts state
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [fraudAlertsLoading, setFraudAlertsLoading] = useState(false);
  
  // Insights state
  const [insights, setInsights] = useState<{
    spendingPatterns: string[];
    recommendations: string[];
    anomalies: string[];
  } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  
  // Risk score state
  const [riskScore, setRiskScore] = useState<{ score: number; factors: string[] } | null>(null);
  const [riskScoreLoading, setRiskScoreLoading] = useState(false);

  // Load data when authentication status changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    } else {
      // Clear data when not authenticated
      clearData();
    }
  }, [isAuthenticated, user]);

  // Refresh analytics when period changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshAnalytics();
    }
  }, [analyticsPeriod, isAuthenticated, user]);

  const clearData = () => {
    setAnalytics(null);
    setTransactions([]);
    setFraudAlerts([]);
    setInsights(null);
    setRiskScore(null);
    setCurrentPage(1);
    setHasMoreTransactions(true);
    setTotalTransactions(0);
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([
        refreshAnalytics(),
        refreshTransactions(),
        refreshFraudAlerts(),
        refreshInsights(),
        refreshRiskScore(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const refreshAnalytics = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setAnalyticsLoading(true);
      const response = await apiClient.getAnalytics(analyticsPeriod);
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        console.error('Failed to load analytics:', response.message);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data. Please try again.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const refreshTransactions = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setTransactionsLoading(true);
      setCurrentPage(1);
      
      const response = await apiClient.getTransactionHistory(1, 20);
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotalTransactions(response.data.total);
        setHasMoreTransactions(response.data.transactions.length < response.data.total);
      } else {
        console.error('Failed to load transactions:', response.message);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transaction history. Please try again.');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (!isAuthenticated || !user || !hasMoreTransactions || transactionsLoading) return;
    
    try {
      setTransactionsLoading(true);
      const nextPage = currentPage + 1;
      
      const response = await apiClient.getTransactionHistory(nextPage, 20);
      
      if (response.success && response.data) {
        setTransactions(prev => [...prev, ...response.data!.transactions]);
        setCurrentPage(nextPage);
        setHasMoreTransactions(response.data.transactions.length === 20);
      } else {
        console.error('Failed to load more transactions:', response.message);
      }
    } catch (error) {
      console.error('Error loading more transactions:', error);
      Alert.alert('Error', 'Failed to load more transactions. Please try again.');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const refreshFraudAlerts = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setFraudAlertsLoading(true);
      const response = await apiClient.getFraudAlerts();
      
      if (response.success && response.data) {
        setFraudAlerts(response.data);
      } else {
        console.error('Failed to load fraud alerts:', response.message);
      }
    } catch (error) {
      console.error('Error loading fraud alerts:', error);
      Alert.alert('Error', 'Failed to load fraud alerts. Please try again.');
    } finally {
      setFraudAlertsLoading(false);
    }
  };

  const refreshInsights = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setInsightsLoading(true);
      const response = await apiClient.getInsights();
      
      if (response.success && response.data) {
        setInsights(response.data);
      } else {
        console.error('Failed to load insights:', response.message);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
      Alert.alert('Error', 'Failed to load insights. Please try again.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const refreshRiskScore = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setRiskScoreLoading(true);
      const response = await apiClient.getRiskScore();
      
      if (response.success && response.data) {
        setRiskScore(response.data);
      } else {
        console.error('Failed to load risk score:', response.message);
      }
    } catch (error) {
      console.error('Error loading risk score:', error);
      Alert.alert('Error', 'Failed to load risk score. Please try again.');
    } finally {
      setRiskScoreLoading(false);
    }
  };

  const value: DataContextType = {
    // Analytics
    analytics,
    analyticsLoading,
    analyticsPeriod,
    setAnalyticsPeriod,
    refreshAnalytics,
    
    // Transactions
    transactions,
    transactionsLoading,
    refreshTransactions,
    loadMoreTransactions,
    hasMoreTransactions,
    
    // Fraud Alerts
    fraudAlerts,
    fraudAlertsLoading,
    refreshFraudAlerts,
    
    // Insights
    insights,
    insightsLoading,
    refreshInsights,
    
    // Risk Score
    riskScore,
    riskScoreLoading,
    refreshRiskScore,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
