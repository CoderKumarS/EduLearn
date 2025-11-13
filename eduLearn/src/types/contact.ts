// Contact and Support Types

export interface ContactForm {
    fullName: string;
    email: string;
    subject: string;
    message: string;
    category?: 'general' | 'technical' | 'billing' | 'feedback' | 'other';
    priority?: 'low' | 'medium' | 'high';
    attachments?: string[];
}

export interface ContactSubmission extends ContactForm {
    id: string;
    userId?: string;
    submittedAt: string;
    status: 'pending' | 'in-progress' | 'resolved' | 'closed';
    assignedTo?: string;
    response?: string;
    respondedAt?: string;
}

export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
    createdAt: string;
    updatedAt: string;
    assignedTo?: string;
    messages: TicketMessage[];
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    senderType: 'user' | 'support';
    message: string;
    attachments?: string[];
    timestamp: string;
}

export interface TeamMember {
    id: string;
    name: string;
    title: string;
    bio: string;
    photo: string;
    email?: string;
    linkedin?: string;
    twitter?: string;
    specialties?: string[];
}

export interface SocialMediaLink {
    platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'github';
    url: string;
    handle?: string;
}
