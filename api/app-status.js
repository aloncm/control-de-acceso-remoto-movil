// api/app-status.js
export default function handler(req, res) {
  res.status(200).json({ active: true });
}