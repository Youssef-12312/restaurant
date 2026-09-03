export default function handler(req, res) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  console.log("Visitor IP:", ip);

  res.status(200).json({ message: "OK" });
}