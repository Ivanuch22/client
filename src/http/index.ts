import axios from 'axios';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const { NEXT_STRAPI_API_URL } = publicRuntimeConfig;

const server = axios.create({
  baseURL: `${NEXT_STRAPI_API_URL}`,
});

const serverForPlugins = axios.create({
  baseURL: `${NEXT_STRAPI_API_URL.replace("/api", "")}`,
});


export { server,serverForPlugins, NEXT_STRAPI_API_URL };
