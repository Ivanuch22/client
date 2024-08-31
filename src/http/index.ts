import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const { NEXT_STRAPI_API_URL,NEXT_STRAPI_BASED_URL } = publicRuntimeConfig;

const server = axios.create({
  baseURL: `${NEXT_STRAPI_API_URL}`,
});

const serverForPlugins = axios.create({
  baseURL: `${NEXT_STRAPI_BASED_URL}`,
});


export { server,serverForPlugins, NEXT_STRAPI_API_URL };
