import React from "react";
import SearchResult from "@/components/molecules/SearchResult";
import { ISearchResultItem } from "@/components/molecules/SearchResult";


export interface ISearchResults {
    results: ISearchResultItem[];
}

const SearchResults: React.FC<ISearchResults> = ({ results }) => {
    return (
        <div className="container-xl" style={{ maxWidth: '1140px', margin: '0 auto' }}>
             {results.map(({ id, seo_description, seo_title, url, locale }: ISearchResultItem) => {
                return (
                    <SearchResult
                        key={id}
                        seo_description={seo_description}
                        seo_title={seo_title}
                        url={url}
                        locale={locale}
                    />
                )
            })}
        </div>
    );
};

export default SearchResults;