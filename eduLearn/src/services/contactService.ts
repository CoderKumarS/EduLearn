import api from './api';
import { ContactForm, ContactSubmission, SupportTicket, TicketMessage } from '../types/contact';

class ContactService {
    // Contact Form Submission
    async submitContactForm(formData: ContactForm): Promise<ContactSubmission> {
        try {
            const response = await api.post('/contact/submit/', formData);
            return response.data;
        } catch (error) {
            console.error('Error submitting contact form:', error);
            throw error;
        }
    }

    // Get Contact Submissions (for admin)
    async getContactSubmissions(
        status?: 'pending' | 'in-progress' | 'resolved' | 'closed'
    ): Promise<ContactSubmission[]> {
        try {
            const params = status ? `?status=${status}` : '';
            const response = await api.get(`/contact/submissions/${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching contact submissions:', error);
            return [];
        }
    }

    // Update Contact Submission Status
    async updateSubmissionStatus(
        submissionId: string,
        status: 'pending' | 'in-progress' | 'resolved' | 'closed',
        response?: string
    ): Promise<ContactSubmission> {
        const data: any = { status };
        if (response) {
            data.response = response;
            data.respondedAt = new Date().toISOString();
        }

        const apiResponse = await api.patch(`/contact/submissions/${submissionId}/`, data);
        return apiResponse.data;
    }

    // Support Tickets
    async createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<SupportTicket> {
        const response = await api.post('/support/tickets/', ticketData);
        return response.data;
    }

    async getSupportTickets(userId: string): Promise<SupportTicket[]> {
        try {
            const response = await api.get(`/support/tickets/?user=${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching support tickets:', error);
            return [];
        }
    }

    async getSupportTicket(ticketId: string): Promise<SupportTicket> {
        const response = await api.get(`/support/tickets/${ticketId}/`);
        return response.data;
    }

    async updateSupportTicket(
        ticketId: string,
        updates: Partial<SupportTicket>
    ): Promise<SupportTicket> {
        const response = await api.patch(`/support/tickets/${ticketId}/`, updates);
        return response.data;
    }

    async closeSupportTicket(ticketId: string): Promise<void> {
        await api.post(`/support/tickets/${ticketId}/close/`);
    }

    // Ticket Messages
    async addTicketMessage(ticketId: string, message: Omit<TicketMessage, 'id' | 'timestamp'>): Promise<TicketMessage> {
        const response = await api.post(`/support/tickets/${ticketId}/messages/`, message);
        return response.data;
    }

    async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
        try {
            const response = await api.get(`/support/tickets/${ticketId}/messages/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching ticket messages:', error);
            return [];
        }
    }

    // FAQ
    async getFAQs(category?: string): Promise<any[]> {
        try {
            const params = category ? `?category=${category}` : '';
            const response = await api.get(`/support/faqs/${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            return [];
        }
    }

    // Email Validation
    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone Validation
    validatePhone(phone: string): boolean {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }
}

export const contactService = new ContactService();
