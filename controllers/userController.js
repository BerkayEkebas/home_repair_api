import { db } from "../connect.js";
import bcrypt from "bcryptjs";

// Kullanıcı şifre değiştirme
export const changePassword = (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json("Tüm alanlar zorunludur");
  }

  const q = "SELECT * FROM users WHERE user_id = ?";
  
  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Kullanıcı bulunamadı");

    const user = data[0];
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    
    if (!isPasswordValid) return res.status(401).json("Mevcut şifre hatalı");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    const updateQ = "UPDATE users SET password = ? WHERE user_id = ?";
    
    db.query(updateQ, [hashedPassword, userId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Şifre başarıyla güncellendi");
    });
  });
};

// Admin kullanıcı güncelleme
export const updateUser = (req, res) => {
  const userId = req.params.id;
  const { name, email, role, room_id, is_active } = req.body;

  const q = "SELECT * FROM users WHERE user_id = ?";
  
  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Kullanıcı bulunamadı");

    const updateFields = [];
    const values = [];

    if (name) {
      updateFields.push("name = ?");
      values.push(name);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (role) {
      updateFields.push("role = ?");
      values.push(role);
    }
    if (room_id !== undefined) {
      updateFields.push("room_id = ?");
      values.push(room_id);
    }
    if (is_active !== undefined) {
      updateFields.push("is_active = ?");
      values.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json("Güncellenecek alan bulunamadı");
    }

    values.push(userId);

    const updateQ = `UPDATE users SET ${updateFields.join(", ")} WHERE user_id = ?`;
    
    db.query(updateQ, values, (err, data) => {
      if (err) return res.status(500).json(err);
      
      // Güncellenmiş kullanıcıyı getir
      const selectQ = "SELECT user_id, name, email, role, room_id, is_active FROM users WHERE user_id = ?";
      db.query(selectQ, [userId], (err, userData) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(userData[0]);
      });
    });
  });
};

// Tüm kullanıcıları getir
export const getUsers = (req, res) => {
  const q = "SELECT user_id, name, email, role, room_id, is_active FROM users";
  
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// Tüm kullanıcıları getir (admin)
export const getAllUsers = (req, res) => {
  const q = "SELECT user_id, name, email, role, room_id, is_active, created_at FROM users ORDER BY created_at DESC";
  
  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ 
      en: "Database error", 
      ko: "데이터베이스 오류" 
    });
    return res.status(200).json(data);
  });
};

// Yeni kullanıcı oluştur (admin)
export const createUser = (req, res) => {
  const { name, email, password, role, room_id } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ 
      en: "All fields are required", 
      ko: "모든 필드는 필수입니다" 
    });
  }

  if (!['student', 'admin'].includes(role)) {
    return res.status(400).json({ 
      en: "Role must be 'student' or 'admin'", 
      ko: "역할은 'student' 또는 'admin'이어야 합니다" 
    });
  }

  // Email kontrolü
  const emailCheckQ = "SELECT user_id FROM users WHERE email = ?";
  db.query(emailCheckQ, [email], (err, emailData) => {
    if (err) return res.status(500).json({ 
      en: "Database error", 
      ko: "데이터베이스 오류" 
    });
    
    if (emailData.length > 0) return res.status(400).json({ 
      en: "Email already exists", 
      ko: "이미 존재하는 이메일입니다" 
    });

    // Şifreyi hashle - DÜZELTME: require yerine import edilen bcrypt kullan
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const insertQ = "INSERT INTO users (name, email, password, role, room_id, is_active) VALUES (?, ?, ?, ?, ?, 1)";
    const values = [name, email, hashedPassword, role, room_id || null];

    db.query(insertQ, values, (err, result) => {
      if (err) return res.status(500).json({ 
        en: "Database error", 
        ko: "데이터베이스 오류" 
      });

      const selectQ = "SELECT user_id, name, email, role, room_id, is_active, created_at FROM users WHERE user_id = ?";
      db.query(selectQ, [result.insertId], (err, userData) => {
        if (err) return res.status(500).json({ 
          en: "Database error", 
          ko: "데이터베이스 오류" 
        });
        
        return res.status(201).json({
          user: userData[0],
          message: {
            en: "User created successfully",
            ko: "사용자가 성공적으로 생성되었습니다"
          }
        });
      });
    });
  });
};

// Kullanıcı sil (soft delete - is_active = 0)
export const deleteUser = (req, res) => {
  const userId = req.params.id;

  const q = "UPDATE users SET is_active = 0 WHERE user_id = ?";
  
  db.query(q, [userId], (err, result) => {
    if (err) return res.status(500).json({ 
      en: "Database error", 
      ko: "데이터베이스 오류" 
    });
    
    if (result.affectedRows === 0) return res.status(404).json({ 
      en: "User not found", 
      ko: "사용자를 찾을 수 없습니다" 
    });

    return res.status(200).json({ 
      en: "User deleted successfully", 
      ko: "사용자가 성공적으로 삭제되었습니다" 
    });
  });
};