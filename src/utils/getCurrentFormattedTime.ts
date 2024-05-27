export default function getCurrentFormattedTime() {
    const now = new Date();
    
    const padZero = (num:any) => (num < 10 ? '0' : '') + num;

    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const day = padZero(now.getDate());
    const month = padZero(now.getMonth() + 1); // Місяці починаються з 0
    const year = now.getFullYear();

    return `${day}.${month}.${year} ${hours}:${minutes} `;
}