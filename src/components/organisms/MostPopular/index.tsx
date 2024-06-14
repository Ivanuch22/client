import getConfig from "next/config";
import Link from "next/link";
import formatDateTime from "@/utils/formateDateTime";

interface MostPopular {
    data: any[];
    title: string
}
const { publicRuntimeConfig } = getConfig();
const { NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;

const truncateWithEllipsis = (text: string, maxLength = 60) => {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
};

const MostPopular = ({ data, title }: MostPopular) => {
    return (
        <article className='mostpopular mt-3'>
            <h3 className="mostpopular__title mb-3">{title}</h3>
            {data.map(page => {
                const { page_title, image, admin_date, url, comments } = page.attributes;
                return (
                    <div className="mostpopular__row mb-3" key={page.id}>
                        <div className="mostpopular__img-block" style={{ backgroundImage: `url(${NEXT_STRAPI_BASED_URL + image.data?.attributes.url})` }}>
                        </div>
                        <div className="mostpopular__text-block">
                            <Link href={url} className="mostpopular__text-title"><h2 className="mostpopular__text-title">{truncateWithEllipsis(page_title)}</h2></Link>
                            <div className="mostpopular__row d-inline-flex align-items-center ">
                                <div className="mostpopular__text-time d-inline-flex align-items-center  gap-3">
                                    <span className="date part d-inline-flex align-items-center">
                                        {formatDateTime(admin_date)} </span>
                                    <span className="comments part d-inline-flex align-items-center" >
                                        <Link href={`${url}#comment`} className="d-inline-flex align-items-center">
                                            <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                                                width="22px" height="22px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xmlSpace="preserve">
                                                <g>
                                                    <path fill="#231F20" d="M60,0H16c-2.211,0-4,1.789-4,4v6H4c-2.211,0-4,1.789-4,4v30c0,2.211,1.789,4,4,4h7c0.553,0,1,0.447,1,1v11
		c0,1.617,0.973,3.078,2.469,3.695C14.965,63.902,15.484,64,16,64c1.039,0,2.062-0.406,2.828-1.172l14.156-14.156
		c0,0,0.516-0.672,1.672-0.672S50,48,50,48c2.211,0,4-1.789,4-4v-8h6c2.211,0,4-1.789,4-4V4C64,1.789,62.211,0,60,0z M52,44
		c0,1.105-0.895,2-2,2c0,0-14.687,0-15.344,0C32.709,46,32,47,32,47S20,59,18,61c-2.141,2.141-4,0.391-4-1c0-1,0-12,0-12
		c0-1.105-0.895-2-2-2H4c-1.105,0-2-0.895-2-2V14c0-1.105,0.895-2,2-2h46c1.105,0,2,0.895,2,2V44z M62,32c0,1.105-0.895,2-2,2h-6V14
		c0-2.211-1.789-4-4-4H14V4c0-1.105,0.895-2,2-2h44c1.105,0,2,0.895,2,2V32z"/>
                                                    <path fill="#231F20" d="M13,24h13c0.553,0,1-0.447,1-1s-0.447-1-1-1H13c-0.553,0-1,0.447-1,1S12.447,24,13,24z" />
                                                    <path fill="#231F20" d="M41,28H13c-0.553,0-1,0.447-1,1s0.447,1,1,1h28c0.553,0,1-0.447,1-1S41.553,28,41,28z" />
                                                    <path fill="#231F20" d="M34,34H13c-0.553,0-1,0.447-1,1s0.447,1,1,1h21c0.553,0,1-0.447,1-1S34.553,34,34,34z" />
                                                </g>
                                            </svg>
                                            <span className="disqus-comment-count" >{comments.data.length}</span>
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            )}
        </article>
    )
    return
}
export default MostPopular;