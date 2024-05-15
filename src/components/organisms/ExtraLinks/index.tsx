import React from "react";

import ExtraLink, { IExtraLink } from "@/components/molecules/ExtraLink";

interface IExtraLinks {
    data: IExtraLink[]
}

const ExtraLinks: React.FC<IExtraLinks> = ({ data }) => {
    return (
        <ol 
            itemScope 
            itemType="https://schema.org/BreadcrumbList" 
            style={{ margin: '2rem 0 0 0', paddingLeft: '1rem' }}
        >
            {data.map(({ text, link, id }) => {
                    return <ExtraLink key={id} link={link} text={text} />
            })}
        </ol>
    )
}

export default ExtraLinks