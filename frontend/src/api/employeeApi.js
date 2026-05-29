import axiosClient from './axiosClient';

const employeeApi = {
    getAll: () => axiosClient.get('users/employees/'),
    create: (data) => axiosClient.post('users/employees/', data),
    update: (id, data) => axiosClient.patch(`users/employees/${id}/`, data),
    delete: (id) => axiosClient.delete(`users/employees/${id}/`),
};

export default employeeApi;