import { db } from "../connect.js"


export const getRequests = (req, res) => {
    const q = "SELECT * FROM requests";
  
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  };

  export const createOffer = (req, res) => {
    let { request_id, user_id, price, message } = req.body; // expert_id yerine user_id alıyoruz.
    console.log(req.body);

    if (!request_id || !user_id || !price || !message) {
        return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }

    request_id = parseInt(request_id, 10);
    user_id = parseInt(user_id, 10);
    price = parseFloat(price);

    if (isNaN(request_id) || isNaN(user_id) || isNaN(price)) {
        return res.status(400).json({ error: 'Geçersiz veri formatı.' });
    }

    // Önce user_id'ye karşılık gelen expert_id'yi bul
    const findExpertQuery = `SELECT id FROM experts WHERE user_id = ?`;

    db.query(findExpertQuery, [user_id], (err, results) => {
        if (err) {
            console.error('Uzman bilgisi alınırken hata:', err);
            return res.status(500).json({ error: 'Uzman bilgisi alınırken hata oluştu.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Bu kullanıcıya ait uzman bulunamadı.' });
        }

        const expert_id = results[0].id;

        // Teklif ekleme sorgusu
        const insertOfferQuery = `
            INSERT INTO offers (request_id, expert_id, price, message) 
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertOfferQuery, [request_id, expert_id, price, message], (err, result) => {
            if (err) {
                console.error('Teklif ekleme hatası:', err);
                return res.status(500).json({ error: 'Teklif eklenirken bir hata oluştu.' });
            }
            res.json({ success: true, message: 'Teklif başarıyla eklendi.', offer_id: result.insertId });
        });
    });
};



export const createDetails = (req, res) => {
  const { user_id, services_id, experience_years, phone } = req.body;

  // Eğer tüm alanlar gelmemişse, hata dönüyoruz
  if (!user_id || !services_id || !experience_years || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // services_id'yi string olarak saklıyoruz
  const servicesStr = services_id;

  // SQL sorgusunu hazırlıyoruz
  const query = 'INSERT INTO experts (user_id, services_id, experience_years, phone) VALUES (?, ?, ?, ?)';

  db.query(query, [user_id, servicesStr, experience_years, phone], (err, result) => {
    if (err) {
      console.error('Error inserting expert:', err);
      return res.status(500).json({ message: 'Error adding expert' });
    }
    res.status(200).json({ message: 'Expert added successfully', expertId: result.insertId });
  });
};


export const getOneExpertDetails = (req, res) => {
  const userId = req.body.user_id; // URL parametresinden user_id'yi alıyoruz

  // SQL sorgusunu hazırlıyoruz
  const query = 'SELECT * FROM experts WHERE user_id = ?';

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching expert:', err);
      return res.status(500).json({ message: 'Error fetching expert' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No expert found for this user' });
    }

    res.status(200).json(result[0]); // İlk kaydı döndürüyoruz (tek bir uzman)
  });
};

