import Vue from 'vue'
import axios from 'axios'
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在请求前拦截
axios.interceptors.request.use(config=>{
    config.headers.Authorization = window.sessionStorage.getItem('token');
    //在最后必须return 
    return config;
})