import api from './client'

export const movementsApi = {
  getAll: (params?: any) => api.get('/movements', { params }),
  getById: (id: number) => api.get(`/movements/${id}`),
  create: (data: any) => api.post('/movements', data),
  update: (id: number, data: any) => api.put(`/movements/${id}`, data),
  getByResource: (resourceType: string, resourceId: number) => 
    api.get(`/movements/resource/${resourceType}/${resourceId}`)
}





