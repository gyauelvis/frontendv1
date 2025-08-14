import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import analyticsService from '../services/analyticsService';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

const router = Router();

// Get analytics data with time range filtering
router.get('/', [
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'quarterly'])
    .withMessage('Period must be daily, weekly, monthly, or quarterly'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
        timestamp: new Date()
      } as ApiResponse);
    }

    const { period = 'weekly', startDate, endDate } = req.query;
    
    // For demo purposes, get the test user ID from the database
    // In production, this would come from authentication middleware
    let userId: string;
    
    try {
      const testUser = await prisma.users.findUnique({
        where: { email: 'test@example.com' }
      });
      
      if (testUser) {
        userId = testUser.id;
        console.log('Using test user ID for analytics:', userId);
      } else {
        userId = req.user?.id || 'demo-user';
        console.log('No test user found, using fallback ID:', userId);
      }
    } catch (error) {
      userId = req.user?.id || 'demo-user';
      console.log('Error getting test user, using fallback ID:', userId);
    }

    let analyticsData;
    
    try {
      // Try to get real data from database
      analyticsData = await analyticsService.getUserAnalytics(
        userId,
        period as 'daily' | 'weekly' | 'monthly' | 'quarterly',
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
    } catch (dbError) {
      console.warn('Database analytics failed, falling back to mock data:', dbError);
      
      // Fallback to mock data for development
      analyticsData = generateMockAnalyticsData(period as string, userId);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Analytics data retrieved successfully',
      data: analyticsData,
      timestamp: new Date()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date()
    } as ApiResponse);
  }
});

// Get spending insights and recommendations
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 'temp-user-id';

    // TODO: Replace with real ML-based insights
    const insights = {
      spendingPatterns: [
        'Your food spending increased by 15% this month',
        'You typically spend more on weekends',
        'Consider setting a budget for entertainment category'
      ],
      recommendations: [
        'Set up automatic savings transfers',
        'Review your subscription services',
        'Consider using public transport more often'
      ],
      anomalies: [
        'Unusual large transaction on Friday',
        'Multiple small transactions in short time period'
      ]
    };

    const response: ApiResponse = {
      success: true,
      message: 'Insights retrieved successfully',
      data: insights,
      timestamp: new Date()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Insights error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date()
    } as ApiResponse);
  }
});

// Export analytics data
router.post('/export', [
  body('format')
    .isIn(['pdf', 'csv', 'json'])
    .withMessage('Export format must be pdf, csv, or json'),
  body('period')
    .isIn(['daily', 'weekly', 'monthly', 'quarterly'])
    .withMessage('Period must be daily, weekly, monthly, or quarterly'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
        timestamp: new Date()
      } as ApiResponse);
    }

    const { format, period } = req.body;
    const userId = req.user?.id || 'temp-user-id';

    // TODO: Implement actual export functionality
    const exportData = {
      format,
      period,
      userId,
      downloadUrl: `https://api.example.com/exports/${userId}_${period}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    const response: ApiResponse = {
      success: true,
      message: 'Export initiated successfully',
      data: exportData,
      timestamp: new Date()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date()
    } as ApiResponse);
  }
});

// Helper function to generate mock analytics data
function generateMockAnalyticsData(period: string, userId: string) {
  const baseData = {
    topRecipients: [
      { name: 'Kwame Asante', amount: 3200, count: 12 },
      { name: 'Ama Osei', amount: 2800, count: 8 },
      { name: 'Kofi Mensah', amount: 2100, count: 6 },
      { name: 'Abena Addo', amount: 1800, count: 5 },
      { name: 'Yaw Boateng', amount: 1400, count: 4 },
    ],
    topSenders: [
      { name: 'Efua Kufuor', amount: 4500, count: 10 },
      { name: 'Nana Kwesi', amount: 3800, count: 7 },
      { name: 'Akosua Sarpong', amount: 2900, count: 6 },
      { name: 'Kojo Anane', amount: 2200, count: 5 },
      { name: 'Adwoa Owusu', amount: 1800, count: 4 },
    ],
    topCategories: [
      { category: 'Food & Dining', amount: 5200, percentage: 32 },
      { category: 'Transport & Fuel', amount: 3800, percentage: 23 },
      { category: 'Utilities & Bills', amount: 2800, percentage: 17 },
      { category: 'Shopping & Retail', amount: 2400, percentage: 15 },
      { category: 'Entertainment', amount: 1800, percentage: 11 },
      { category: 'Healthcare', amount: 800, percentage: 2 },
    ],
    transactionTrends: [
      { date: 'Mon', amount: 1800, count: 15 },
      { date: 'Tue', amount: 2400, count: 22 },
      { date: 'Wed', amount: 2100, count: 19 },
      { date: 'Thu', amount: 2800, count: 25 },
      { date: 'Fri', amount: 3500, count: 28 },
      { date: 'Sat', amount: 3200, count: 24 },
      { date: 'Sun', amount: 1900, count: 16 },
    ],
    summary: {
      totalSent: 18700,
      totalReceived: 15200,
      totalTransactions: 149,
      averageAmount: 227,
    }
  };

  // Adjust data based on period
  if (period === 'monthly') {
    baseData.summary.totalSent *= 4;
    baseData.summary.totalReceived *= 4;
    baseData.summary.totalTransactions *= 4;
    baseData.transactionTrends = baseData.transactionTrends.map(t => ({
      ...t,
      amount: t.amount * 4,
      count: t.count * 4
    }));
  } else if (period === 'quarterly') {
    baseData.summary.totalSent *= 12;
    baseData.summary.totalReceived *= 12;
    baseData.summary.totalTransactions *= 12;
    baseData.transactionTrends = baseData.transactionTrends.map(t => ({
      ...t,
      amount: t.amount * 12,
      count: t.count * 12
    }));
  }

  return baseData;
}

export default router;