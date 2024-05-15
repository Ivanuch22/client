export default function removeFirstSlash(url: string, locale: string) {
  if(locale == 'ru'){
    return url.substring(1)
  }
  return url;
}