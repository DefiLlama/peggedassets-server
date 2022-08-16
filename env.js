try{
    require('dotenv').config()
}catch(e){}
module.exports = {
    INFLUXDB_TOKEN: process.env.INFLUXDB_TOKEN,
}
