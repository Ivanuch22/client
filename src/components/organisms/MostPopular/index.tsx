import getConfig from "next/config";
import Link from "next/link";
import formatDateTime from "@/utils/formateDateTime";
import Image from "next/image";
import $t from '@/locale/global';
import { useRouter } from "next/router";

interface MostPopular {
    data: any[];
    title: string
}
type Locale = 'uk' | 'ru' | 'en';

const { publicRuntimeConfig } = getConfig();
const { NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;

const truncateWithEllipsis = (text: string, maxLength = 60) => {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
};

const MostPopular = ({ data, title }: MostPopular) => {
    const router = useRouter();
    const locale: Locale = (router.locale === 'ua' ? 'uk' : router.locale) as Locale || 'ru';
    return (
        <aside className='mostpopular mt-3'>
            <h2 className="mostpopular__title mb-3">{title}</h2>
            <ul style={{ paddingLeft: "0", listStyleType: "none" }}>
                {data.map(page => {
                    const { page_title, image, admin_date, url, comments } = page.attributes;
                    return (
                        <li className="mostpopular__row mb-3" key={page.id}>
                            <div className="mostpopular__img-block"
                            >
                                <Image
                                    src={NEXT_STRAPI_BASED_URL + image.data?.attributes.url}
                                    width={500}
                                    height={500}
                                    alt={image.data?.attributes?.alternativeText || "Picture of the author"}
                                    style={{ width: "100%", aspectRatio: "1 / 0.6" }}
                                />
                            </div>
                            <div className="mostpopular__text-block">
                                <h3 className="mostpopular__text-title">
                                    <Link href={url} className="mostpopular__text-title">{truncateWithEllipsis(page_title)}</Link>
                                </h3>
                                <div className="mostpopular__row d-inline-flex align-items-center ">
                                    <dl className="mostpopular__text-time d-inline-flex align-items-center  gap-3">
                                        <dt className="notShowOnPage">
                                            {$t[locale].seo.publishTime}
                                        </dt>
                                        <dd>
                                            <time dateTime={(admin_date)} className="date part d-inline-flex align-items-center">
                                                {formatDateTime(admin_date)}
                                            </time>
                                        </dd>
                                        <dt className="notShowOnPage">
                                            {$t[locale].seo.comments}
                                        </dt>
                                        <dd>
                                        <Link href={`${url}#comment`} className="d-inline-flex align-items-center">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M16.8951 4H7.10486C5.95297 4 5.36572 4.1134 4.7545 4.44028C4.19025 4.74205 3.74205 5.19025 3.44028 5.7545C3.1134 6.36572 3 6.95297 3 8.10486V13.8951C3 15.047 3.1134 15.6343 3.44028 16.2455C3.74205 16.8097 4.19025 17.258 4.7545 17.5597L4.8954 17.6314C5.4124 17.8807 5.94467 17.9827 6.84879 17.9979L7.1 18V20.2149C7.1 20.6467 7.2693 21.0614 7.57155 21.3698L7.68817 21.478C8.33091 22.0196 9.29233 21.9937 9.90488 21.3933L13.366 18H16.8951C18.047 18 18.6343 17.8866 19.2455 17.5597C19.8097 17.258 20.258 16.8097 20.5597 16.2455C20.8866 15.6343 21 15.047 21 13.8951V8.10486C21 6.95297 20.8866 6.36572 20.5597 5.7545C20.258 5.19025 19.8097 4.74205 19.2455 4.44028C18.6343 4.1134 18.047 4 16.8951 4ZM6.91166 5.80107L16.8951 5.8C17.7753 5.8 18.0818 5.85919 18.3966 6.02755C18.6472 6.16155 18.8384 6.35282 18.9725 6.60338C19.1408 6.91818 19.2 7.2247 19.2 8.10486V13.8951L19.1956 14.2628C19.1792 14.8698 19.1149 15.1303 18.9725 15.3966C18.8384 15.6472 18.6472 15.8384 18.3966 15.9725C18.0818 16.1408 17.7753 16.2 16.8951 16.2H13L12.8832 16.2076C12.6907 16.2328 12.5103 16.3198 12.3701 16.4572L8.9 19.857V17.1C8.9 16.6029 8.49706 16.2 8 16.2H7.10486L6.73724 16.1956C6.13019 16.1792 5.86975 16.1149 5.60338 15.9725C5.35282 15.8384 5.16155 15.6472 5.02755 15.3966C4.85919 15.0818 4.8 14.7753 4.8 13.8951V8.10486L4.80439 7.73724C4.8208 7.13019 4.88509 6.86975 5.02755 6.60338C5.16155 6.35282 5.35282 6.16155 5.60338 6.02755C5.89396 5.87214 6.1775 5.80975 6.91166 5.80107Z" fill="#D3DCE2" />
                                            </svg>
                                            <span className="disqus-comment-count" >{comments.data.length}</span>
                                        </Link>
                                        </dd>

                                        
                                    </dl>
                                </div>
                            </div>
                        </li>
                    )
                }
                )}
            </ul>

        </aside>
    )
    return
}
export default MostPopular;