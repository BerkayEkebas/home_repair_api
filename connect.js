import mysql from 'mysql'

export const db = mysql.createPool({
  host: "bpasfgzdepj5tujg2mws-mysql.services.clever-cloud.com",
  user: "upl1pwizkddw176s",
  password: "fofbfANvdp89zbksRxf1",
  database: "bpasfgzdepj5tujg2mws",
  waitForConnections: true, 
  connectionLimit: 10,      
  queueLimit: 0,            
});