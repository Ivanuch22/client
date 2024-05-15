interface IQA {
    id: number;
    text: string;
    link: string;
}

export default (data: any) => {
    if (!data.length) { return null; }
    const qa = data.reduce((acc: any, { id, text, link }: IQA, i: number) => {
        acc.push({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
                "@id": link,
                "name": text
            }
        },);

        return acc;
    }, [])

    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": qa
    })
} 