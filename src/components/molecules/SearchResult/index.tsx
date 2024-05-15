import { $ } from '@/utils/utils';
import React from 'react';
import getConfig from 'next/config';

export interface ISearchResultItem {
  id?: string;
  seo_title: string;
  seo_description: string;
  url: string;
  locale: string;
}

const { publicRuntimeConfig } = getConfig();
const { NEXT_FRONT_URL } = publicRuntimeConfig;

const SearchResult: React.FC<ISearchResultItem> = ({
  seo_title,
  seo_description,
  url,
  locale,
}) => {
  const description =
    seo_description.length > 256
      ? `${seo_description.slice(0, 256)}...`
      : seo_description;

  const displayedLocale =
    locale === 'ru' ? '' : `/${locale === 'uk' ? 'ua' : locale}`;
  const href = `${NEXT_FRONT_URL}${displayedLocale}${url}`;

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="search-item" style={{ marginTop: '1.5rem' }}>
          <h4 className="mb-1">
            <a href={href} target="_blank">
              {seo_title}
            </a>
          </h4>
          <a className="font-13 text-success mb-3" href={href} target="_blank">
            {href}
          </a>
          <p className="mb-0 text-muted">{description}</p>
        </div>
        <hr className="hr" />

        <div className="clearfix"></div>
      </div>
    </div>
  );
};

export default SearchResult;
