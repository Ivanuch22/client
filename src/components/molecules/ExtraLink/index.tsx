import React from "react";

export interface IExtraLink {
    id?: string;
    text: string;
    link: string;
}

const ExtraLink: React.FC<IExtraLink> = ({text, link}) => {
    return (
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a itemProp="item" href={link}>
            <span itemProp="name">{text}</span></a>
            <meta itemProp="position" content="1" />
        </li>
    )
}

export default ExtraLink