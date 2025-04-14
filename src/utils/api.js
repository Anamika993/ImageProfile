import axios from 'axios';

const api = axios.create({
  baseURL: 'http://dev3.xicomtechnologies.com/xttest',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default api;