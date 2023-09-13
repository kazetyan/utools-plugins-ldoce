import axios from "axios";

const instance = axios.create();

const get = (url: string, params?: any) => instance.get(url, {params})

const post = (url: string, params?: any, data?: any) => instance.post(url, {params, data})


export {
    get,
    post
}