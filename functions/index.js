const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

/* ── Nodemailer ── */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/* ══════════════════════════════════════
   1) RECALC DAILY REVENUE
══════════════════════════════════════ */
exports.recalcDailyRevenue = functions.firestore
  .document("orders/{orderId}")
  .onWrite(async (change, context) => {

    const after = change.after.exists ? change.after.data() : null;
    const before = change.before.exists ? change.before.data() : null;

    const datesToRecalc = new Set();

    const extractDate = (data) => {
   if (!data || !data.createdAt) return null;
      const d = data.createdAt.toDate
        ? data.createdAt.toDate()
        : new Date(data.createdAt);
      return d.toISOString().split("T")[0];
    };

    const dateAfter = after ? extractDate(after) : null;
    const dateBefore = before ? extractDate(before) : null;

    if (dateAfter) datesToRecalc.add(dateAfter);
    if (dateBefore && dateBefore !== dateAfter) datesToRecalc.add(dateBefore);

    await Promise.all(
      [...datesToRecalc].map((dayKey) => recalcDay(dayKey))
    );

    return null;
  });

/* ── Helper ── */
async function recalcDay(dayKey) {
  const [year, month] = dayKey.split("-");

  const snap = await db
    .collection("orders")
    .where("status", "==", "completed")
    .get();

  let total = 0;
  let count = 0;

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const d = data.createdAt?.toDate
      ? data.createdAt.toDate()
      : new Date(data.createdAt);
    const orderDate = d.toISOString().split("T")[0];

    if (orderDate === dayKey) {
      total += data.total || 0;
      count += 1;
    }
  });

  await db.collection("daily_revenue").doc(dayKey).set({
    date: dayKey,
    totalRevenue: total,
    completedOrders: count,
    month: `${year}-${month}`,
    year: parseInt(year),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/* ══════════════════════════════════════
   2) MONTHLY EMAIL REPORT
══════════════════════════════════════ */
exports.sendMonthlyReport = functions.pubsub
  .schedule("0 8 1 * *")
  .timeZone("Africa/Cairo")
  .onRun(async () => {

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonth.getFullYear();
    const mm = String(lastMonth.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}-${mm}`;
    const monthName = lastMonth.toLocaleString("ar-EG", {
      month: "long",
      year: "numeric",
    });

    const snap = await db
      .collection("daily_revenue")
      .where("month", "==", monthKey)
      .get();

    let totalRevenue = 0;
    let totalOrders = 0;

    snap.forEach((d) => {
      const data = d.data();
      totalRevenue += data.totalRevenue || 0;
      totalOrders += data.completedOrders || 0;
    });

    const avgOrder =
      totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";

    const mailOptions = {
      from: `"Shelter Reports" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_OWNER,
      subject: `📊 تقرير شهر ${monthName}`,
      html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; padding: 24px; max-width: 600px;">
          <h2 style="color: #ff6b35;">📊 التقرير الشهري — ${monthName}</h2>
          <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
            <tr style="background:#fff0eb;">
              <td style="padding:12px; font-weight:bold;">إجمالي الأرباح</td>
              <td style="padding:12px; font-size:1.2rem; font-weight:bold; color:#ff6b35;">
                ${totalRevenue.toFixed(2)} EGP
              </td>
            </tr>
            <tr>
              <td style="padding:12px;">الأوردرات المكتملة</td>
              <td style="padding:12px;">${totalOrders}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:12px;">متوسط قيمة الأوردر</td>
              <td style="padding:12px;">${avgOrder} EGP</td>
            </tr>
          </table>
          <p style="margin-top:24px; color:#6b7280; font-size:0.85rem;">Shelter Restaurant System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Monthly report sent for ${monthKey}`);
    return null;
  });