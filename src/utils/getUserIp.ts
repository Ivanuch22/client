import axios from 'axios';
export default async function getUserIp (){
    const getUserIp = await axios.post("/api/userIp")
    const userIp = getUserIp.data.ip ||"not found"
    return userIp
}
