import { db } from "../connect.js"


export const getRoomStatusById = (req, res) => {
  const userId = req.body.user_id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const qUser = "SELECT room_id, role FROM users WHERE user_id = ?";

  db.query(qUser, [userId], (err, userData) => {
    if (err) return res.status(500).json({ message: "Database error (users)", error: err });
    if (userData.length === 0) return res.status(404).json({ message: "User not found" });

    const userRoomId = userData[0].room_id;
    const userRole = userData[0].role;

    // Admin ise tüm odaların detaylı bilgilerini getir
    if (userRole === 'admin' || userRoomId === 0) {
      const qAll = `
        SELECT 
          rs.*,
          r.room_number,
          r.room_capacity,
          f.floor_number,
          b.building_name,
          GROUP_CONCAT(DISTINCT u.name) as occupants,
          COUNT(DISTINCT u.user_id) as occupant_count
        FROM room_status rs
        LEFT JOIN rooms r ON rs.room_id = r.room_id
        LEFT JOIN floors f ON r.floor_id = f.floor_id
        LEFT JOIN buildings b ON f.building_id = b.building_id
        LEFT JOIN users u ON r.room_id = u.room_id AND u.is_active = 1
        GROUP BY rs.status_id, r.room_id, f.floor_id, b.building_id
        ORDER BY b.building_name, f.floor_number, r.room_number
      `;
      
      db.query(qAll, (err, allData) => {
        if (err) return res.status(500).json({ message: "Database error (room_status)", error: err });
        return res.status(200).json(allData);
      });
    } else {
      // Student ise sadece kendi odasının detaylı bilgilerini getir
      const qRoom = `
        SELECT 
          rs.*,
          r.room_number,
          r.room_capacity,
          f.floor_number,
          b.building_name,
          GROUP_CONCAT(DISTINCT u.name) as occupants,
          COUNT(DISTINCT u.user_id) as occupant_count
        FROM room_status rs
        LEFT JOIN rooms r ON rs.room_id = r.room_id
        LEFT JOIN floors f ON r.floor_id = f.floor_id
        LEFT JOIN buildings b ON f.building_id = b.building_id
        LEFT JOIN users u ON r.room_id = u.room_id AND u.is_active = 1
        WHERE rs.room_id = ?
        GROUP BY rs.status_id, r.room_id, f.floor_id, b.building_id
      `;
      
      db.query(qRoom, [userRoomId], (err, roomData) => {
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




