import { server } from '@/http';
import qs from 'qs';

export default async function fetchUrls(
  apiRoute: 'pages' | 'page-seos' | 'accordions'|"blogs"|"newss",
  fields: string[]
) {
  let array = [];
  let isFetching: boolean = true;
  let currentPage: number = 1;
  while (isFetching) {
    if (currentPage > 1000) {
      isFetching = false;
    }

    const request = await server.get(
      `/${apiRoute}?${qs.stringify(
        {
          locale: 'all',
          fields: fields,
          sort: ['createdAt:desc'],
          pagination: {
            page: currentPage,
            pageSize: 100,
          },
        },
        {
          encodeValuesOnly: true,
        }
      )}`
    );
    const requestData = await request.data;
    array.push(...requestData.data);
    if (
      requestData.meta.pagination.page == requestData.meta.pagination.pageCount
    ) {
      isFetching = false;
    }
    currentPage++;
  }
  return array;
}
