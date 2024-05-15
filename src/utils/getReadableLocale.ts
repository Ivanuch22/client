export default function getReadableLocale(
  strapiLocale: string,
  hideRu: boolean = true
) {
  switch (strapiLocale) {
    case 'uk':
      return 'ua';
    case 'ua':
      return 'ua';
    case 'en':
      return 'en';
    case 'ru':
      if (hideRu) {
        return '';
      }
      return 'ru';
    default:
      return 'ru';
  }
}
