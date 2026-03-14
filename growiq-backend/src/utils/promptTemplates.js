// src/utils/promptTemplates.js
// AI prompt templates for Claude API — Sprint 9
const logger = require('./logger');

/**
 * Build insight generation prompt
 */
function buildInsightPrompt(campaignData, historicalData, clientProfile) {
    return `You are a senior digital marketing analyst for ${clientProfile?.business_name || 'a business'}, a ${clientProfile?.business_type || 'general'} business in India.

CURRENT 7-DAY CAMPAIGN PERFORMANCE:
${JSON.stringify(campaignData, null, 2)}

HISTORICAL 30-DAY BASELINE:
${JSON.stringify(historicalData, null, 2)}

Return ONLY a JSON object with this exact structure:
{
  "health_score": <0-100>,
  "insights": [
    {
      "type": "alert|opportunity|forecast|recommendation",
      "severity": "low|medium|high|critical",
      "title": "<50 chars",
      "body": "<200 chars actionable insight",
      "affected_campaign": "",
      "estimated_impact_inr": <number>
    }
  ],
  "revenue_forecast_next_30_days": <number>,
  "top_performing_platform": "",
  "recommended_budget_shift": {
    "from": "",
    "to": "",
    "amount_inr": <number>
  }
}`;
}

/**
 * Build content idea prompt
 */
function buildContentIdeasPrompt(businessType, platform, recentPerformance) {
    return `Generate 5 social media content ideas for a ${businessType} business on ${platform}.

Recent performance data:
${JSON.stringify(recentPerformance, null, 2)}

Return a JSON array of 5 content ideas with: title, description, content_type (image/video/carousel/reel), estimated_engagement.`;
}

/**
 * Build ad copy prompt
 */
function buildAdCopyPrompt(businessType, product, targetAudience, platform) {
    return `Write 3 ad copy variations for a ${businessType} business promoting "${product}" on ${platform}.

Target audience: ${targetAudience}

Return JSON array with: headline, primary_text, description, call_to_action.`;
}

module.exports = {
    buildInsightPrompt,
    buildContentIdeasPrompt,
    buildAdCopyPrompt,
};
