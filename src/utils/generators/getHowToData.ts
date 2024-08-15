const { NEXT_FRONT_URL } = process.env;

export default (data: any) => {
    if(!data){ return null; }
    const {
        title,
        description,
    } = data;


    const microdata = {
        "@context": "http://schema.org",
        "@type": "HowTo",
        "name": title,
        "description": description,
        
        "step": data.steps.reduce((acc: any, {title, body, image}: ISTep, i: number) => {
            const step = {
                "@type": "HowToStep",
                "name": title,
                "text": body,
                "position": i + 1
            } as any; 

            if(image.data){
                step.image = `${NEXT_FRONT_URL}${image.data.attributes.url}`
            }

            acc.push(step)
            return acc;
        }, [])
     }

    return JSON.stringify(microdata);
}

interface ISTep {
    title: string;
    body: string;
    image: {
        data: {
            id: number;
            attributes: {
                url: string;
            }
        }
    }
}