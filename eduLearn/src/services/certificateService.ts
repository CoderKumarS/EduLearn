import api from './api';
import { Certificate } from '../types/course';

export const certificateService = {
    // Get all certificates
    getCertificates: async (params?: {
        student?: number;
        course?: number;
        is_valid?: boolean;
    }) => {
        const response = await api.get<Certificate[]>('/certificates/', { params });
        return response.data;
    },

    // Get certificate by ID
    getCertificateById: async (id: number) => {
        const response = await api.get<Certificate>(`/certificates/${id}/`);
        return response.data;
    },

    // Generate certificate
    generateCertificate: async (certificateData: Partial<Certificate>) => {
        const response = await api.post<Certificate>('/certificates/', certificateData);
        return response.data;
    },

    // Download certificate
    downloadCertificate: async (id: number) => {
        const response = await api.get<{ download_url: string }>(
            `/certificates/${id}/download/`
        );
        return response.data.download_url;
    },

    // Verify certificate
    verifyCertificate: async (certId: string) => {
        const response = await api.get<{
            valid: boolean;
            certificate?: Certificate;
            message?: string;
        }>(`/certificates/verify/${certId}/`);
        return response.data;
    },
};

export default certificateService;
