import supabase from '../config/supabase.js';

export class NotificationService {
    async sendNotification(receiverId, notificationData, senderId = null) {
        const notification = {
            SenderID: senderId,
            ReceiverID: receiverId,
            Type: notificationData.Type || 'Message',
            Priority: notificationData.Priority || 'Normal',
            Subject: notificationData.Subject,
            Message: notificationData.Message,
            IsRead: 0,
            RelatedModule: notificationData.RelatedModule || null,
            RelatedID: notificationData.RelatedID || null,
            ExpiresAt: notificationData.ExpiresAt || null
        };

        const { data, error } = await supabase
            .from('notification')
            .insert(notification)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async sendBroadcast(receiverIds, notificationData, senderId = null) {
        const notifications = receiverIds.map(receiverId => ({
            SenderID: senderId,
            ReceiverID: receiverId,
            Type: notificationData.Type || 'Message',
            Priority: notificationData.Priority || 'Normal',
            Subject: notificationData.Subject,
            Message: notificationData.Message,
            IsRead: 0,
            RelatedModule: notificationData.RelatedModule || null,
            RelatedID: notificationData.RelatedID || null,
            ExpiresAt: notificationData.ExpiresAt || null
        }));

        const { data, error } = await supabase
            .from('notification')
            .insert(notifications)
            .select();

        if (error) throw error;
        return data;
    }

    async getUserNotifications(userId) {
        const { data, error } = await supabase
            .from('notification')
            .select('*')
            .eq('ReceiverID', userId)
            .order('CreatedAt', { ascending: false });

        if (error) throw error;
        return data;
    }

    async markAsRead(notificationId) {
        const { data, error } = await supabase
            .from('notification')
            .update({ 
                IsRead: 1, 
                ReadAt: new Date().toISOString() 
            })
            .eq('NotificationID', notificationId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUnreadCount(userId) {
        const { count, error } = await supabase
            .from('notification')
            .select('*', { count: 'exact', head: true })
            .eq('ReceiverID', userId)
            .eq('IsRead', 0);

        if (error) throw error;
        return count;
    }
}
