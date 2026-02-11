import axios from "axios";

export const api = axios.create({
    baseURL: "https://vozativa.backend.zrhdsarhreh.shop",
    //baseURL: "http://localhost:8020",
    paramsSerializer: (params) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => query.append(key, v));
            } else if (value !== undefined && value !== null) {
                query.append(key, value as string);
            }
        });
        return query.toString();
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
