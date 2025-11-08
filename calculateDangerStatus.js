export const calculateDangerStatus = ({
    temperature,
    humidity,
    power_consumption,
    ac_status,
    window_status,
    room_occupancy
}) => {
    // Varsayılan olarak tehlike yok
    let danger = 0;

    // 1️⃣ Güç tüketimi 2kW üzerindeyse
    if (power_consumption > 2000) {
        danger = 1;
    }
    // 2️⃣ Klima ve pencere aynı anda açıksa
    else if (ac_status === 1 && window_status === 1) {
        danger = 2;
    }
    // 3️⃣ Sıcaklık veya nem anormalse (örnek: sıcaklık > 30°C veya nem < %20 ya da > %80)
    else if (temperature > 30 || humidity < 20 || humidity > 80) {
        danger = 3;
    }
    // 4️⃣ Oda boş (occupancy = 0) ama yüksek elektrik tüketimi varsa
    else if (room_occupancy === 0 && power_consumption > 1000) {
        danger = 4;
    }

    return danger;
}
