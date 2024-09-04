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
export type Locale = 'uk' | 'ru' | 'en';

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
                                    loading="lazy"
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
                                                <picture>
                                                    <Image src={"/img/commentSvgIcon.svg"} width="24" height="24" alt="comment icon"></Image>
                                                </picture>
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