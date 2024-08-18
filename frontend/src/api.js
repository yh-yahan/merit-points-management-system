import axios from 'axios'

export default axios.create({
  baseURL: 'https://localhost/api/v1/', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, 
});
