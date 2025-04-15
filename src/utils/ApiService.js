import api from './api';

export const fetcher = async ({ method, url, data, params }) => {
  const response = await api({
    method,
    url,
    data,
    params,
  });
  return response.data;
};
