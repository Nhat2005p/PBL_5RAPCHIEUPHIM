import axiosClient from './axiosClient';

const showtimeApi = {
    getAll: (params) => axiosClient.get('cinema/showtimes/', { params }),
    create: (data) => axiosClient.post('cinema/showtimes/', data),
    delete: (id) => axiosClient.delete(`cinema/showtimes/${id}/`),
};

export default showtimeApi;