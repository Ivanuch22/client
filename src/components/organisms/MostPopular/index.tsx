import getConfig from "next/config";
import Link from "next/link";
import formatDateTime from "@/utils/formateDateTime";

interface MostPopular {
    data: any[];
    title: string
}
const { publicRuntimeConfig } = getConfig();
const { NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;

const truncateWithEllipsis = (text:string, maxLength = 60) => {
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
                const { page_title, image, admin_date, url,comments } = page.attributes;
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
                                      <img src="https://itc.ua/wp-content/themes/ITC_6.0/images/comment_outline_24.svg" height="24" width="24" alt="comment" />
                                      <span className="disqus-comment-count" data-disqus-url="https://itc.ua/ua/novini/sylovu-bronyu-v-seriali-fallout-zrobyly-bez-vtruchannya-bethesda-a-ot-na-robochomu-pip-boy-v-kompaniyi-napolyagaly/" data-disqus-identifier="2259249 https://itc.ua/?p=2259249">{comments.data.length}</span>
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