export default function formatDateTime(dateTime: string, isShowHours = false) {
  const date = new Date(dateTime);
  date.setUTCHours(date.getUTCHours() + 3);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();

  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return isShowHours ? `${day}.${month}.${year} ${hours}:${minutes}` : `${day}.${month}.${year}`;
}

