export default function handler(req, res) {
  const forwarded = req.headers["x-forwarded-for"];

  // Vercel بيحط IP العميل في أول قيمة من x-forwarded-for
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket?.remoteAddress || "Unknown";

  console.log("Visitor IP:", ip);

  res.status(200).json({
    message: "OK",
    ip: ip,
  });
}