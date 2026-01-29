import supabase from '../config/supabase.js';

export class NotificationService {
    async getUnreadCount(userId) {
        const { count, error } = await supabase
            .from('notification')
            .select('*', { count: 'exact', head: true })
            .eq('ReceiverID', userId)
            .eq('IsRead', 0);
        
        if (error) throw error;
        return count || 0;
    }

    async getUserNotifications(userId, limit = 50) {
        const { data, error } = await supabase
            .from('notification')
            .select(`
                *,
                sender:SenderID(UserID, FirstName, LastName, Email)
            `)
            .eq('ReceiverID', userId)
            .order('CreatedAt', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    }

    async markAsRead(notificationId, userId) {
        const { data, error } = await supabase
            .from('notification')
            .update({ 
                IsRead: 1, 
                ReadAt: new Date().toISOString() 
            })
            .eq('NotificationID', notificationId)
            .eq('ReceiverID', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }

    async markAllAsRead(userId) {
        const { data, error } = await supabase
            .from('notification')
            .update({ 
                IsRead: 1, 
                ReadAt: new Date().toISOString() 
            })
            .eq('ReceiverID', userId)
            .eq('IsRead', 0)
            .select();
        
        if (error) throw error;
        return data;
    }

    async deleteNotification(notificationId, userId) {
        const { error } = await supabase
            .from('notification')
            .delete()
            .eq('NotificationID', notificationId)
            .eq('ReceiverID', userId);
        
        if (error) throw error;
        return true;
    }

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

    async broadcastToRole(roleId, notificationData, senderId = null) {
        let userIds = [];

        if (roleId === 'all') {
            const { data: users, error } = await supabase
                .from('user')
                .select('UserID')
                .eq('IsActive', 1);
            
            if (error) throw error;
            userIds = users.map(u => u.UserID);
        } else {
            const { data: roleData, error: roleError } = await supabase
                .from('role')
                .select('RoleID')
                .eq('RoleName', roleId)
                .single();

            if (roleError) throw new Error(`Rol '${roleId}' no encontrado`);

            const { data: userRoles, error: urError } = await supabase
                .from('user_role')
                .select('UserID')
                .eq('RoleID', roleData.RoleID);

            if (urError) throw urError;
            userIds = userRoles.map(ur => ur.UserID);
        }

        if (userIds.length === 0) {
            return [];
        }

        return await this.sendBroadcast(userIds, notificationData, senderId);
    }

    async getSentNotifications(userId, limit = 50) {
        const { data, error } = await supabase
            .from('notification')
            .select(`
                *,
                receiver:ReceiverID(UserID, FirstName, LastName, Email)
            `)
            .eq('SenderID', userId)
            .order('CreatedAt', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    }
}