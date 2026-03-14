# GrowIQ Frontend Test Plan (Sprints 1–7)

Welcome to the **GrowIQ Manual Testing Guide**. This document helps you quickly navigate and test all the functional components built during Sprints 1 through 7 before we move on to Sprint 8 (AI Engine Setup).

---

## 🔒 1. Authentication (Sprint 2)
Test the foundational auth pipelines.

* [ ] **Register a New Account** 
  * Go to `http://localhost:3000/register`
  * Fill in a test name, email, agency name, and password.
  * *Expected:* You should be redirected directly into the dashboard upon success.
* [ ] **Login with Existing Account**
  * Go to `http://localhost:3000` (or `/login`).
  * Ensure your authenticated session drops you on the dashboard.
* [ ] **Logout functionality**
  * Click the `Logout` icon at the bottom of the left sidebar.

---

## 📊 2. Dashboard Overview (Sprint 4 & 5)
Test the main dashboard aggregates.

* [ ] **Live KPIs**
  * Upon log-in, wait for the summary cards at the top of the dashboard to flash loading states and then populate.
  * *Expected:* `Active Clients`, `Live Campaigns`, `Avg ROAS`, and `Health Score` should be pulling live numbers.
* [ ] **Navigation & Responsiveness**
  * Click around the sidebar to navigate smoothly between pages without page reloads (SPA behavior).

---

## 👥 3. Client Management (Sprint 3 & 6)
Test interactions surrounding clients.

* [ ] **View Client List**
  * Go to `Clients` in the sidebar. See the tabular layout with health score badges.
* [ ] **Add a Client**
  * Click `+ Add Client` (top right).
  * Fill the modal with a mock client (e.g., "Neo Digital", monthly retainer: 50,000).
  * *Expected:* Client appears in the list after submitting.
* [ ] **Client Detail View**
  * Click on any client in the table.
  * *Expected:* Detail page with sub-tabs (`Overview`, `Campaigns`, `Integrations`, etc.).
* [ ] **Edit Client Info**
  * Under the `Overview` tab, click `Edit` in the Contact Information box.
  * Make a change, click Save, and verify it persists.
* [ ] **Platform Integrations (New in Sprint 6)**
  * Switch to the `Integrations` sub-tab.
  * Click `Connect (Dev Mode)` on Meta Ads or Google Ads.
  * *Expected:* State switches to "Connecting..." then "Connected" with a green badge and mock account ID. You can also disconnect it.
* [ ] **Client Campaigns Tab**
  * Switch to the `Campaigns` sub-tab to see a list of campaigns scoped precisely to this client.

---

## 📈 4. Campaign Management (Sprint 5)
Test the performance data tracking.

* [ ] **Global Campaigns List**
  * Go to `Campaigns` in the main sidebar.
  * View the top aggregated stats strip (Spend, Conversions, Active ROAS).
  * Filter the table using the `Platform` and `Status` dropdowns at the top right of the table component.
  * Test clicking the fast `⟳ Sync` button on a specific table row to re-trigger mock data points.
* [ ] **Campaign Detail & Sparklines**
  * Click any campaign row to access its profile (`/campaigns/[id]`).
  * Click through the `KPI Cards` below the header (Spend, Impressions, Clicks, Conversions, CTR, ROAS). 
  * *Expected:* The **Sparkline mini-chart** immediately to their right will re-render with the selected metric's 30-day historical points.
* [ ] **Inline Editing**
  * Hover over the campaign's `Status` badge at the top left (next to the name). Click the pencil icon to pause/activate the campaign.

---

## ⚙️ 5. Agency Settings & System (Sprint 6 & 7)
Test global platform features and alert flows.

* [ ] **Agency Profile Edit**
  * Go to `Settings` in the sidebar.
  * On the `Agency Profile` tab, click `Edit` on Business Details, change it, and Save.
* [ ] **Platform Integration Guide (Heatmap)**
  * On Settings, switch to the `Platform Guide` tab (second icon).
  * *Expected:* You will see a global overview of how many clients are connected to Meta, Google Ads, GA4, etc., giving you quick insight into your agency's API footprint.
* [ ] **Real-time Notifications Dropdown**
  * Look at the **Bell icon** in the top-right corner of the TopBar.
  * *Expected:* It should have a red counter badge (showing seed notifications).
  * Click the Bell to open the dropdown panel.
  * Click a notification (like "Campaign ROAS Alert").
  * *Expected:* It should mark the notification as read (purple dot disappears), close the dropdown, and redirect your screen to `/campaigns`.
  * Click the Bell again and use the `Mark all read` button at the top of the panel.

## 🧠 6. AI Insights Engine (Sprint 8)
Test the core mock intelligence loop.

* [ ] **View AI Insights Dashboard**
  * Go to `AI Insights` in the sidebar.
  * You should see a blank empty state if no insights have been generated yet.
* [ ] **Generate Client Insights (Mock Mode Engine)**
  * Use the top filter row to select a specific client (e.g., "FreshBite Foods" or "TechNova Solutions").
  * Click the **`⚡ Run Engine`** button in the top right.
  * *Expected:* State will switch to 'Scanning...', and then populate with rule-based AI alerts (e.g. Campaign ROAS Alert, Scale Opportunity, Forecast).
* [ ] **Insight Interactions**
  * Find an active insight card with a `Review Campaign` actionable button. Clicking it should redirect you directly to that problematic campaign.
  * Hover over an insight card. Click **`✓ Mark Resolved`**.
  * *Expected:* The card should turn gray/transparent and visually mark as resolved without a page refresh.
  * Try clicking **`Dismiss`**; the card should vanish from the UI.

## 🤖 7. Advanced Insights & Forecasting (Sprint 9)
Test the automated global insights and dashboard sync.

* [ ] **Nightly Engine (Background Job)**
  * A scheduled background job now generates insights globally across all active clients at 2:00 AM every night.
  * To manually trigger this for testing without waiting for 2:00 AM, send a POST request with your JWT token to `http://localhost:5000/api/v1/dev/run-engine`.
  * *Note*: If you already ran "Run Engine" inside the UI from Sprint 8, you'll see those insights here.
* [ ] **Global Dashboard Real-Time View**
  * Go to the main `Dashboard` page at `/dashboard`.
  * Review the KPI strip. Sprint indicator should now show `S9` as Active.
  * *Expected:* The "Recent AI Insights" section on the dashboard is no longer mocked data. It dynamically fetches the latest active insights for your agency.
  * Click any insight row on the dashboard; it should route you quickly to the `/dashboard/insights` hub.

## 👥 8. Team Roles & Access Control (Sprint 10)
Test the team invite system and role assignments.

* [ ] **View Team Settings**
  * Go to `Settings` -> `Team Members` in the sidebar.
  * *Expected:* You should see your own account listed as "Owner (You)".
* [ ] **Send an Invitation**
  * Click the `+ Invite Member` button.
  * Type a mock test name and email, assign them the `Manager` role from the dropdown, and submit.
  * *Expected:* The new row will appear below your profile. 
* [ ] **Edit Roles**
  * Find the new member's row. Try changing their role dropdown from `Manager` to `Viewer`.
  * *Expected:* The change hits the database and reflects instantly.
* [ ] **Delete Member**
  * Click the `X` icon on the far right of the new user's row.
  * Confirm the browser alert popup.
  * *Expected:* The user is wiped from your agency's table.

## 💳 9. Invoicing & Payments (Sprint 11)
Test the billing lifecycle and automated GST calculations.

* [ ] **Generate Mock Data**
  * Send a POST request to `http://localhost:5000/api/v1/dev/seed` to generate the new mock invoices for your connected clients.
* [ ] **View Invoicing Hub**
  * Go to `Invoicing` in the sidebar.
  * *Expected:* High-level cards should show "Total Outstanding" and "Total Collected" sums from the database.
* [ ] **Create a Manual Invoice**
  * Click `+ Create Invoice`. 
  * Select a client, enter an amount (e.g., 50000), and a due date.
  * *Expected:* The invoice is created with `INV-XXXX` format, status is "Pending", and 18% GST is automatically appended to the total.
* [ ] **Status Filtering**
  * Use the status pills at the top (All, Pending, Paid, Overdue) to filter the table.
* [ ] **Simulate Payment**
  * Hover over a "Pending" invoice. Click the green `✓` icon.
  * *Expected:* The status changes to "Paid" (green), the "Total Collected" stat at the top increments, and the paid timestamp is recorded.

## 📊 10. Automated Reporting Engine (Sprint 12)
Test the deep-dive metric aggregation and AI summarization.

* [ ] **Generate Performance Report**
  * Go to `Reports` in the sidebar.
  * Click `+ Generate Report`.
  * Select a client and a date range.
  * *Expected:* The system will scan `campaign_metrics` for that client, calculate ROAS/Spend, and generate a report card with a logical **AI Summary Preview**.
* [ ] **Filter by Client**
  * Use the client filter tabs at the top.
  * *Expected:* The reports list should instantly filter to only show that client's historical performance.
* [ ] **Weekly Automation (Background)**
  * A background job (`generateReports.job.js`) is now configured to run every Monday at 3:00 AM.
  * It automatically creates 7-day reports for every active client.
* [ ] **Delete Maintenance**
  * Try deleting a generated report using the `Trash` icon on hover.
  * *Expected:* Report is removed from the DB and UI.

## 🔍 11. SEO Performance Tracker (Sprint 13)
Test organic metric monitoring and keyword tracking.

* [ ] **Generate SEO Seed Data**
  * Send a POST request to `http://localhost:5000/api/v1/dev/seed` to generate 7 days of historical rankings for your clients.
* [ ] **View SEO Dashboard**
  * Go to `SEO Tracker` in the sidebar.
  * *Expected:* High-level cards will show "Top 3 Rankings" and "Top 10 Rankings" based on the seeded data.
* [ ] **Track a New Keyword**
  * Use the client dropdown to select a client.
  * Click `+ Add Keyword`.
  * Enter a search term (e.g. "digital agency near me") and a landing page URL.
  * *Expected:* The keyword appears in the table with a starting rank (mocked) and automatically calculated difficulty/volume.
* [ ] **Analyze Ranking Changes**
  * Look at the "Change" column. 
  * *Expected:* Green arrows indicate a drop in rank (improvement), and red arrows indicate an increase (plunge).
* [ ] **Keyword Retention**
  * Click the `Trash` icon on any keyword row.
  * *Expected:* The keyword is instantly removed from tracking.

## 📱 12. Social Content Scheduler (Sprint 14)
Test multi-platform content planning and engagement tracking.

* [ ] **Generate Social Seed Data**
  * Send a POST request to `http://localhost:5000/api/v1/dev/seed` to generate mock published and scheduled posts.
* [ ] **View Social Hub**
  * Go to `Social Hub` in the sidebar.
  * *Expected:* High-level cards will show "Total Reach" and "Scheduled Posts" counts.
* [ ] **Schedule a New Post**
  * Click `+ Schedule Content`.
  * Select a client, a platform (Instagram/LinkedIn/etc.), and write a caption.
  * *Expected:* The post appears in the grid as "Scheduled" with the correct platform icon.
* [ ] **Analyze Engagement**
  * Find a "Published" post card.
  * *Expected:* Real-time (mocked) stats for Likes, Reach, and Engagement are displayed on the card.
* [ ] **One-Click Publishing**
  * Find a "Scheduled" post. Click `Publish Now`.
  * *Expected:* The status changes to "Published" (green) and engagement metrics are instantly generated.

## 📱 13. Client Portal Mobile View (Sprint 15)
Test the mobile-first client experience and data transparency.

* [ ] **View Portal Preview**
  * Click `Client Portal` in the sidebar or go to `http://localhost:3000/portal`.
  * *Expected:* The UI should transform into a sleek, mobile-app style interface (best viewed by resizing your browser or using Chrome DevTools mobile view).
* [ ] **KPI Tiles**
  * Look at the simplified cards for Spend and ROAS.
  * *Expected:* They should match the live metrics in your main dashboard for that specific client.
* [ ] **Action Required Card**
  * Check the "Action Required" section.
  * *Expected:* It should display any "Pending" invoices for that client with a one-click payment call-to-action.
* [ ] **Report Archive**
  * Find the "Recent Reports" list.
  * *Expected:* Scrolling through shows generated reports with a premium download icon.
* [ ] **Ranking Snapshot**
  * Check the "Top Keywords" section.
  * *Expected:* It should show the client's best-performing SEO terms with position indicators.

---

### Ready for the final step?
Once you are done verifying the UI, we are ready to kick off **Sprint 16: Security Audit & Production Readiness**!
