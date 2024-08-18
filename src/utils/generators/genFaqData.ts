interface IQA {
    question: string;
    answer: string;
}

export default (data: any) => {
    if(!data){ return null; }
    const qa = data.attributes.items.reduce((acc: any, {question, answer}: IQA) => {
        acc.push({
            "@type": "Question",
            "name": question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": answer
            }
        });

        return acc;
    }, [])

    return JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": qa
    })
} 