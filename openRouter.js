import dotenv from 'dotenv';
import axios from "axios";

dotenv.config();
const API_KEY = process.env.API_KEY;
console.log("API_KEY:", process.env.API_KEY);
async function getDangerStatusFromAI(data) {
  const prompt = `
You are an AI system that determines a danger level (danger_status) based on room sensor data.

Rules:
1 If power consumption is greater than 2000 watts (2kW) => danger_status = 1  
2 If the air conditioner (ac_status = 1) and the window (window_status = 1) are both open => danger_status = 2  
3 If temperature is above 30°C OR humidity is below 20% OR above 80% => danger_status = 3  
4 If the room is empty (room_occupancy = 0) and power consumption is higher than 1000 watts => danger_status = 4  
5 If none of the above conditions apply => danger_status = 0  

Sensor Data:
- Temperature: ${data.temperature} °C  
- Humidity: ${data.humidity} %  
- Power Consumption: ${data.power_consumption} W  
- Air Conditioner Status (ac_status): ${data.ac_status}  
- Window Status (window_status): ${data.window_status}  
- Room Occupancy (room_occupancy): ${data.room_occupancy}  

Respond with only one integer number (0, 1, 2, 3, or 4).  
Do not include any explanations, words, or symbols — just the number.
`;

const MODEL = 'minimax/minimax-m2:free'; 

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost',
          'X-Title': 'Danger Level Calculator'
        }
      }
    );
    
    const danger_status = parseInt(response.data.choices[0].message.content.trim(), 10);
    console.log("AI danger_status:"+danger_status)
    return isNaN(danger_status) ? 0 : danger_status;

  } catch (error) {
    console.error('AI Request Error:', error.response?.data || error.message);
    return 0;
  }
}
export default getDangerStatusFromAI;