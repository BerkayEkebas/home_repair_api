import { db } from "../connect.js"
import bcrypt from "bcryptjs"

export const register = (req, res)=>{
//Check user if exist
const {name, password, email, role} = req.body
const q = "SELECT * FROM users WHERE email = ?"

db.query(q,[email], (err, data)=>{
    if(err) return res.status(500).json(err)
    if(data.length) return res.status(409).json("User already exists");

    //Create new User
   //hash password
   const salt = bcrypt.genSaltSync(10);
   const hashedPassword = bcrypt.hashSync(password, salt);

   const q = "INSERT INTO users (`name`, `email`, `password`, `role`) VALUE (?)";
   const values= [name,email,hashedPassword,role]
   db.query(q,[values], (err, data)=>{
    if(err) return res.status(500).json(err)
    return res.status(200).json('User has been created')
   })
    
})

}

export const login = (req, res) => {
    const { email, password } = req.body;

    // Kullanıcıyı email ile bul
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Kullanıcı bulunamadı");

        const user = data[0];  // Kullanıcıyı veritabanından alıyoruz

        // Şifreyi karşılaştır
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) return res.status(401).json("Hatalı şifre");

        // Şifreyi kullanıcı verisinden kaldırarak döndür
        const { password: userPassword, ...userData } = user;  // Şifreyi dışarıya göndermiyoruz
        return res.status(200).json({ user: userData, role:userData.role, user_id:userData.id});
    });
};


export const logout = (req, res) => {
   
    return res.status(200).json("Çıkış başarılı.");
};
