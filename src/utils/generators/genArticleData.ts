import { $ } from "../utils";

const { NEXT_FRONT_URL } = process.env;

export default (data: any, pubDate: string, locale: string, slug: string) => {
    if(!data) { return null; }
    
    const {
        title,
        body,
        images,
        author
    } = data;

    const microdata = {
        "@context": "https://schema.org",
        "@type": "Article",
        "url": `${NEXT_FRONT_URL}${$(locale === 'ru' ? '' : "/"+locale)}${slug}`,
        "headline": title,
        "articleBody": body,
        "datePublished": pubDate,
        "author": [{
            "@type": "Person",
            "name": author?.data?.attributes.real_user_name ? author?.data?.attributes.real_user_name : 'Author',
            "url": author?.data?.attributes.username ? `${NEXT_FRONT_URL}/user/${author?.data?.attributes.username}` : `${NEXT_FRONT_URL}`
          }]

    } as any

    if(images?.data?.length){
        microdata.image = images.data.reduce((acc: any, image: any) => {
            acc.push(`${NEXT_FRONT_URL}${image.attributes.url}`)
            
            return acc;
        }, [])
    }
    
    return JSON.stringify(microdata)
}