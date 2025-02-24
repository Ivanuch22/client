import { populate } from 'dotenv';
import qs from 'qs';

export const getPageSeo = (slug: string, locale: string) => {
  return `/page-seos?${qs.stringify(
    {
      locale: locale,
      populate: [
        'faq.items',
        'extraLinks',
        'code',
        'rating',
        'article.images',
        'article.author',
        'howto.steps.image',
      ],
      filters: {
        url: {
          $eq: slug,
        },
      },
      faq: {
        populate: '*',
        items: {
          populate: '*',
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  )}`;
};
export const getNewsPage = (slug: string, locale: string) => {
  return `/newss?${qs.stringify(
    {
      locale: locale,
      populate: [
        'faq.items',
        'heading',
        'image',
        'extraLinks',
        'code',
        'rating',
        'article.images',
        'howto.steps.image',
        'article.author',
      ],
      filters: {
        url: {
          $eq: slug,
        },
      },
      faq: {
        populate: '*',
        items: {
          populate: '*',
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  )}`;
};

export const getBlogPage = (slug: string, locale: string) => {
  return `/blogs?${qs.stringify(
    {
      locale: locale,
      populate: [
        'faq.items',
        'heading',
        'image',
        'extraLinks',
        'code',
        'rating',
        'article.images',
        'howto.steps.image',
        'article.author',
      ],
      filters: {
        url: {
          $eq: slug,
        },
      },
      faq: {
        populate: '*',
        items: {
          populate: '*',
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  )}`;
};

export const getPage = (slug: string, locale: string) => {
  return `/pages?${qs.stringify(
    {
      populate: [
        'faq.items',
        'extraLinks',
        'code',
        'rating',
        'article.images',
        'howto.steps.image',
        'article.author',
      ],
      locale: locale,
      filters: {
        url: {
          $eq: slug,
        },
      },
      faq: {
        populate: '*',
        items: {
          populate: '*',
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  )}`;
};

export const getAccordion = (slug: string, locale: string) => {
  return `/accordions?${qs.stringify(
    {
      populate: [
        'faq.items',
        'extraLinks',
        'code',
        'rating',
        'article.images',
        'article.author',
        'howto.steps.image',
      ],
      locale: locale,
      filters: {
        url: {
          $eq: slug,
        },
      },
      faq: {
        populate: '*',
        items: {
          populate: '*',
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  )}`;
};

export const getMenu = (slug: string) => {
  return `/menus?${qs.stringify(
    {
      nested: true,
      populate: '*',
      filters: {
        slug: {
          $eq: slug,
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  )}`;
};

export const getUploadByName = (name: string) => {
  return `/upload/files?${qs.stringify(
    {
      nested: true,
      populate: '*',
      filters: {
        name: {
          $eq: name,
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  )}`;
};
export const getIndexPage = (locale: string) => {
  return `/code?${qs.stringify(
    {
      locale: locale,
      // populate: [],
    },
    { encodeValuesOnly: true }
  )}`;
};
export const getCode = (locale: string) => {
  return `/code?${qs.stringify(
    {
      locale: locale,
      fields: ['code'],
      populate: ['code'],
    },
    {
      encodeValuesOnly: true,
    }
  )}`;
};
