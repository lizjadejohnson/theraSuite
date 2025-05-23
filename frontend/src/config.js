//In development, apiUrl will be our backend server: http://localhost:3000/api
//In production, the apiUrl will be our Render URL https://therasuite.onrender.com/api


let apiUrl = '';

if (process.env.NODE_ENV === 'development') {
  apiUrl = 'http://localhost:3000/api';
} else if (process.env.NODE_ENV === 'production') {
  apiUrl = 'https://therasuite.onrender.com/api';
}

export default apiUrl;

//This needs to be imported everywhere we are using URLS.