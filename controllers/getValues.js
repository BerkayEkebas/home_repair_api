import { db } from "../connect.js";

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

  if (!room_number) {
    return res.status(400).json({ error: "room_number zorunlu" });
  }

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

  // 4️⃣ Eğer room_status'ta bu oda zaten varsa güncelle, yoksa ekle
  function saveOrUpdateRoomStatus(room_id) {
    const checkQuery = "SELECT status_id FROM room_status WHERE room_id = ? LIMIT 1";
    db.query(checkQuery, [room_id], (errCheck, resultCheck) => {
      if (errCheck) {
        console.error("DB Error (status check):", errCheck);
        return res.status(500).json({ error: "Status check failed" });
      }

      if (resultCheck.length > 0) {
        // 5️⃣ Güncelle
        const updateQuery = `
          UPDATE room_status
          SET temperature = ?, humidity = ?, power_consumption = ?, ac_status = ?, window_status = ?, room_occupancy = ?, last_updated = CURRENT_TIMESTAMP
          WHERE room_id = ?
        `;
        db.query(updateQuery, [temperature, humidity, power_consumption, ac_status, window_status, room_occupancy, room_id], (errUpdate) => {
          if (errUpdate) {
            console.error("DB Hatası (room_status update):", errUpdate);
            return res.status(500).json({ error: "Error cannot update" });
          }
          res.json({ message: "Data successfully updated" });
        });
      } else {
        // 6️⃣ Yeni kayıt ekle
        const insertQuery = `
          INSERT INTO room_status (room_id, temperature, humidity, power_consumption, ac_status, window_status, room_occupancy)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(insertQuery, [room_id, temperature, humidity, power_consumption, ac_status, window_status, room_occupancy], (errInsert) => {
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

