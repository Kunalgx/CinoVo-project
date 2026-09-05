import { getIndiaAvailability } from "../services/watchmode.service.js";

export async function availability(req, res) {
  const { type, id } = req.params;

  const data = await getIndiaAvailability(
    type,
    Number(id),
  );

  res.json({
    success: true,
    data,
  });
}