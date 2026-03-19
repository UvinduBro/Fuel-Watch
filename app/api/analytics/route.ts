import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export async function GET() {
  const propertyId = process.env.GA_PROPERTY_ID;
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  // If GA is not configured, return mock/empty data gracefully
  if (!propertyId || !credentials) {
    return NextResponse.json({
      configured: false,
      message: "Google Analytics not configured. Set GA_PROPERTY_ID and GOOGLE_APPLICATION_CREDENTIALS_JSON in .env.local",
      summary: { totalUsers: 0, totalPageviews: 0, totalSessions: 0, avgSessionDuration: 0 },
      topPages: [],
      dailyUsers: [],
      deviceBreakdown: [],
      countryBreakdown: [],
    });
  }

  try {
    const parsedCredentials = JSON.parse(credentials);
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials: parsedCredentials });

    // Run multiple GA4 reports in parallel
    const [summaryResponse, pagesResponse, dailyResponse, deviceResponse, countryResponse] = await Promise.all([
      // 1. Summary metrics (last 30 days)
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "sessions" },
          { name: "averageSessionDuration" },
        ],
      }),

      // 2. Top pages
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),

      // 3. Daily users (last 14 days)
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "14daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      }),

      // 4. Device category breakdown
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "totalUsers" }],
      }),

      // 5. Country breakdown
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
        limit: 10,
      }),
    ]);

    // Parse summary
    const summaryRow = summaryResponse[0]?.rows?.[0]?.metricValues || [];
    const summary = {
      totalUsers: parseInt(summaryRow[0]?.value || "0"),
      totalPageviews: parseInt(summaryRow[1]?.value || "0"),
      totalSessions: parseInt(summaryRow[2]?.value || "0"),
      avgSessionDuration: parseFloat(summaryRow[3]?.value || "0"),
    };

    // Parse top pages
    const topPages = (pagesResponse[0]?.rows || []).map(row => ({
      page: row.dimensionValues?.[0]?.value || "/",
      views: parseInt(row.metricValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[1]?.value || "0"),
    }));

    // Parse daily users
    const dailyUsers = (dailyResponse[0]?.rows || []).map(row => {
      const dateStr = row.dimensionValues?.[0]?.value || "";
      const formatted = dateStr ? `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}` : "";
      return {
        date: formatted,
        users: parseInt(row.metricValues?.[0]?.value || "0"),
        pageviews: parseInt(row.metricValues?.[1]?.value || "0"),
      };
    });

    // Parse devices
    const deviceBreakdown = (deviceResponse[0]?.rows || []).map(row => ({
      device: row.dimensionValues?.[0]?.value || "unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));

    // Parse countries
    const countryBreakdown = (countryResponse[0]?.rows || []).map(row => ({
      country: row.dimensionValues?.[0]?.value || "unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));

    return NextResponse.json({
      configured: true,
      summary,
      topPages,
      dailyUsers,
      deviceBreakdown,
      countryBreakdown,
    });
  } catch (error: unknown) {
    console.error("GA API Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ configured: false, error: message }, { status: 500 });
  }
}
