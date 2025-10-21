import { db } from "../connect.js";

// IoT cihazdan gelen veriyi al ve geri dön
export const postRoomStatus = (req, res) => {
  const { room_id, temperature, humidity, power_consumption, ac_status, window_status, room_occupancy } = req.body;

  if (!room_id) {
    return res.status(400).json({ error: "room_id zorunlu" });
  }

  // Sadece gelen veriyi JSON olarak geri dön
  res.json({
    message: "Get the value no DB save",
    data: {
      room_id,
      temperature,
      humidity,
    }
  });
};


// // IoT cihazdan gelen veriyi al
// export const postRoomStatus = (req, res) => {
//   const { room_id, temperature, humidity, power_consumption, ac_status, window_status, room_occupancy } = req.body;

//   if (!room_id) {
//     return res.status(400).json({ error: "room_id zorunlu" });
//   }

//   // Eğer room_id zaten varsa UPDATE, yoksa INSERT
//   const query = `
//     INSERT INTO room_status (room_id, temperature, humidity, power_consumption, ac_status, window_status, room_occupancy)
//     VALUES (?, ?, ?, ?, ?, ?, ?)
//     ON DUPLICATE KEY UPDATE
//       temperature = VALUES(temperature),
//       humidity = VALUES(humidity),
//       power_consumption = VALUES(power_consumption),
//       ac_status = VALUES(ac_status),
//       window_status = VALUES(window_status),
//       room_occupancy = VALUES(room_occupancy),
//       last_updated = CURRENT_TIMESTAMP
//   `;

//   db.query(query, [room_id, temperature, humidity, power_consumption, ac_status, window_status, room_occupancy], (err, result) => {
//     if (err) {
//       console.error("DB Hatası:", err);
//       return res.status(500).json({ error: "Veri kaydedilemedi" });
//     }
//     res.json({ message: "Veri başarıyla kaydedildi" });
//   });
// };
