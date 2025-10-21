import { db } from "../connect.js"


export const getRoomStatusById = (req, res) => {
  const userId = req.body.user_id; // body'den user_id alıyoruz

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const qUser = "SELECT room_id FROM users WHERE user_id = ?";

  db.query(qUser, [userId], (err, userData) => {
    if (err) return res.status(500).json({ message: "Database error (users)", error: err });
    if (userData.length === 0) return res.status(404).json({ message: "User not found" });

    const roomId = userData[0].room_id;

    // Eğer room_id 0 ise admin, tüm room_status tablosunu döndür
    if (roomId === 0) {
      const qAll = "SELECT * FROM room_status";
      db.query(qAll, (err, allData) => {
        if (err) return res.status(500).json({ message: "Database error (room_status)", error: err });
        return res.status(200).json(allData);
      });
    } else {
      // Değilse sadece o room_id'ye ait satırı döndür
      const qRoom = "SELECT * FROM room_status WHERE room_id = ?";
      db.query(qRoom, [roomId], (err, roomData) => {
        if (err) return res.status(500).json({ message: "Database error (room_status)", error: err });
        if (roomData.length === 0) return res.status(404).json({ message: "Room not found" });
        return res.status(200).json(roomData);
      });
    }
  });
};

  

export const createRequests = (req, res) => {
    const { user_id, service_id, description, status } = req.body;

    // Gelen verilerin doğruluğunu kontrol et
    if (!user_id || !service_id || !description || !status) {
        return res.status(400).json({ message: 'Tüm alanlar zorunludur!' });
    }

    // Veritabanına veri ekleme sorgusu
    const q = `
        INSERT INTO requests (user_id, service_id, description, status, created_at) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [user_id, service_id, description, status, new Date()];

    db.query(q, values, (err, result) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ message: 'Sunucu hatası' });
        }

        // Başarılı yanıt
        res.status(201).json({
            message: 'Talep başarıyla oluşturuldu',
            requestId: result.insertId, // Oluşturulan talebin ID'si
        });
    });
};


export const deleteRequest = (req, res) => {
    const { user_id, request_id } = req.body;  // user_id ve request_id'yi body'den alıyoruz
  
    if (!user_id || !request_id) {
      return res.status(400).json({ message: "User ID and Request ID are required" });  // Eksik parametre hatası
    }
  
    const q = "DELETE FROM requests WHERE user_id = ? AND id = ?";
    
    db.query(q, [user_id, request_id], (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Request not found or unauthorized" });
      return res.status(200).json({ message: "Request deleted successfully" });
    });
};

export const getOffersByRequestId = (req, res) => {
  const { request_id } = req.params;

  if (!request_id) {
      return res.status(400).json({ error: 'request_id zorunludur.' });
  }

  const query = `
      SELECT o.*, e.* 
      FROM offers o
      JOIN experts e ON o.expert_id = e.id
      WHERE o.request_id = ?
  `;

  db.query(query, [request_id], (err, results) => {
      if (err) {
          console.error('Teklifleri getirirken hata:', err);
          return res.status(500).json({ error: 'Teklifleri alırken bir hata oluştu.' });
      }

      if (results.length === 0) {
          return res.status(404).json({ error: 'Bu request_id için teklif bulunamadı.' });
      }

      res.json(results);
  });
};




