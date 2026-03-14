// src/services/mockAiService.js
// Mock AI Service — returns realistic insights without calling Claude API (₹0 cost)
const logger = require('../utils/logger');

const MOCK_INSIGHTS = [
    {
        type: 'alert',
        severity: 'high',
        title: 'Meta campaign ROAS below threshold',
        body: 'Brand awareness campaign at 1.8x ROAS vs target 3.5x. Suggest pausing and reallocating ₹15,000 to conversion campaign.',
        affected_campaign: 'Brand Awareness Q1',
        estimated_impact_inr: 15000,
    },
    {
        type: 'opportunity',
        severity: 'medium',
        title: 'Instagram campaign ready to scale',
        body: 'Lead gen campaign showing 5.2x ROAS with 91% delivery. Increasing budget by 30% could yield 35+ additional leads.',
        affected_campaign: 'Lead Generation Instagram',
        estimated_impact_inr: 45000,
    },
    {
        type: 'recommendation',
        severity: 'medium',
        title: 'Shift budget from Google Display to Search',
        body: 'Google Display CTR at 0.12% (below average). Search campaigns show 3.8% CTR. Recommend shifting ₹20,000.',
        affected_campaign: 'Google Display Network',
        estimated_impact_inr: 20000,
    },
    {
        type: 'forecast',
        severity: 'low',
        title: 'Revenue projection trending upward',
        body: 'Based on last 30 days, projected revenue next month is ₹4,20,000 (up 12% from current month). Confidence: 82%.',
        affected_campaign: null,
        estimated_impact_inr: 420000,
    },
    {
        type: 'alert',
        severity: 'critical',
        title: 'Google Ads budget nearly exhausted',
        body: 'Monthly budget 92% consumed with 8 days remaining. Current daily spend ₹3,200 vs budgeted ₹2,500. Adjust immediately.',
        affected_campaign: 'Google Search - Services',
        estimated_impact_inr: 8000,
    },
    {
        type: 'opportunity',
        severity: 'high',
        title: 'Weekend performance spike detected',
        body: 'Conversion rate 40% higher on Sat-Sun. Recommend increasing weekend budget by 50% and reducing weekday spend.',
        affected_campaign: 'All Platforms',
        estimated_impact_inr: 30000,
    },
];

async function generateClientInsights(clientId, campaignData, historicalData) {
    logger.info(`[MOCK AI] Generating insights for client ${clientId}`);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return 3-4 random insights
    const numInsights = 3 + Math.floor(Math.random() * 2);
    const shuffled = [...MOCK_INSIGHTS].sort(() => Math.random() - 0.5);
    const selectedInsights = shuffled.slice(0, numInsights).map((insight, i) => ({
        id: `mock-insight-${Date.now()}-${i}`,
        ...insight,
        action_taken: false,
    }));

    return {
        health_score: 65 + Math.floor(Math.random() * 30),
        insights: selectedInsights,
        revenue_forecast_next_30_days: 350000 + Math.floor(Math.random() * 150000),
        confidence: 0.75 + Math.random() * 0.2,
        top_performing_platform: ['meta', 'google', 'instagram'][Math.floor(Math.random() * 3)],
        recommended_budget_shift: {
            from: 'Google Display',
            to: 'Meta Conversions',
            amount_inr: 15000 + Math.floor(Math.random() * 20000),
        },
    };
}

module.exports = { generateClientInsights };
