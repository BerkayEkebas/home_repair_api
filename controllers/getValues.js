import { calculateDangerStatus } from "../calculateDangerStatus.js";
import { db } from "../connect.js";
import getDangerStatusFromAI from "../openRouter.js";

// IoT cihazdan gelen veriyi al ve geri dön
export const postRoomStatusTest = (req, res) => {
  const { room_number, temperature, humidity, power_consumption, ac_status, window_status, room_occupancy } = req.body;

  // Sadece gelen veriyi JSON olarak geri dön
  res.json({
    message: "Get the value no DB save",
    data: {
      room_number,
      temperature,
      humidity,
    }
  });
};


export const postRoomStatus = (req, res) => {
  const { room_number, temperature, humidity, power_consumption, ac_status, window_status, room_occupancy } = req.body;
  console.log(req.body);
  console.log(req.body.power_consumption+"Power");

  if (!room_number) {
    return res.status(400).json({ error: "room_number zorunlu" });
  }

  const new_ac_status = ac_status ? "ON" : "OFF";
  const new_window_status = window_status ? "OPEN" : "CLOSE";
  const new_room_occupancy = room_occupancy ? "VACANT" : "OCCUPIED";

  // 1️⃣ Odayı bul
  const roomQuery = "SELECT room_id, floor_id FROM rooms WHERE room_number = ?";
  db.query(roomQuery, [room_number], (err, roomResult) => {
    if (err) {
      console.error("DB Hatası (room sorgu):", err);
      return res.status(500).json({ error: "Oda bilgisi alınamadı" });
    }

    if (roomResult.length === 0) {
      // 2️⃣ Oda yoksa: kat numarasını room_number'dan bul
      const floorNumber = parseInt(room_number.charAt(0));
      if (isNaN(floorNumber)) {
        return res.status(400).json({ error: "room_number geçersiz formatta" });
      }

      const floorQuery = "SELECT floor_id FROM floors WHERE floor_number = ? LIMIT 1";
      db.query(floorQuery, [floorNumber], (errFloor, floorResult) => {
        if (errFloor) {
          console.error("DB Hatası (floor sorgu):", errFloor);
          return res.status(500).json({ error: "Floor bilgisi alınamadı" });
        }

        if (floorResult.length === 0) {
          return res.status(404).json({ error: `Floor ${floorNumber} bulunamadı` });
        }

        const floor_id = floorResult[0].floor_id;

        // 3️⃣ Yeni oda ekle
        const insertRoomQuery = "INSERT INTO rooms (floor_id, room_number) VALUES (?, ?)";
        db.query(insertRoomQuery, [floor_id, room_number], (errRoom, roomInsertResult) => {
          if (errRoom) {
            console.error("DB Hatası (room ekleme):", errRoom);
            return res.status(500).json({ error: "Oda oluşturulamadı" });
          }
          const room_id = roomInsertResult.insertId;
          saveOrUpdateRoomStatus(room_id);
        });
      });
    } else {
      const room_id = roomResult[0].room_id;
      saveOrUpdateRoomStatus(room_id);
    }
  });

  // 🔹 Hafızada AI rate limit takibi için cache
  const aiRateLimitCache = new Map(); // key: room_id, value: timestamp

  async function saveOrUpdateRoomStatus(room_id) {
    const danger_status = calculateDangerStatus({
      temperature,
      humidity,
      power_consumption,
      ac_status,
      window_status,
      room_occupancy
    });

    // 🧠 AI çağrısını 1 dakikada 1 defa yap
    const now = Date.now();
    const lastAITime = aiRateLimitCache.get(room_id);
    let danger_status_ai = null;

    if (!lastAITime || now - lastAITime > 60000) {
      try {
        danger_status_ai = await getDangerStatusFromAI({
          temperature,
          humidity,
          power_consumption,
          ac_status,
          window_status,
          room_occupancy
        });
        aiRateLimitCache.set(room_id, now);
        console.log(`✅ AI answer (room_id: ${room_id})`);
      } catch (e) {
        console.error("AI error:", e);
        danger_status_ai = null;
      }
    } else {
      console.log(`⏳ AI çağrısı atlandı (room_id: ${room_id})`);
    }

    const checkQuery = "SELECT status_id FROM room_status WHERE room_id = ? LIMIT 1";
    db.query(checkQuery, [room_id], (errCheck, resultCheck) => {
      if (errCheck) {
        console.error("DB Error (status check):", errCheck);
        return res.status(500).json({ error: "Status check failed" });
      }

      if (resultCheck.length > 0) {
        // ✅ Güncelle
        const updateQuery = `
          UPDATE room_status
          SET temperature = ?, humidity = ?, power_consumption = ?, ac_status = ?, window_status = ?, room_occupancy = ?, 
              last_updated = CURRENT_TIMESTAMP, danger_status = ?, danger_status_ai = IFNULL(?, danger_status_ai)
          WHERE room_id = ?
        `;
        db.query(updateQuery, [
          temperature, humidity, power_consumption,
          new_ac_status, new_window_status, new_room_occupancy,
          danger_status, danger_status_ai, room_id
        ], (errUpdate) => {
          if (errUpdate) {
            console.error("DB Hatası (room_status update):", errUpdate);
            return res.status(500).json({ error: "Error cannot update" });
          }
          res.json({ message: "Data successfully updated" });
        });

      } else {
        // ✅ Yeni kayıt ekle
        const insertQuery = `
          INSERT INTO room_status 
          (room_id, temperature, humidity, power_consumption, ac_status, window_status, room_occupancy, danger_status, danger_status_ai, last_updated)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        db.query(insertQuery, [
          room_id, temperature, humidity, power_consumption,
          new_ac_status, new_window_status, new_room_occupancy,
          danger_status, danger_status_ai
        ], (errInsert) => {
          if (errInsert) {
            console.error("DB Hatası (room_status insert):", errInsert);
            return res.status(500).json({ error: "Error cannot save" });
          }
          res.json({ message: "Data successfully added" });
        });
      }
    });
  }
};
