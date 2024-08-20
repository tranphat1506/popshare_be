import { INotificationDocument } from '@root/features/notifications/interfaces/notifications.interface';
import { NotificationModel } from '@root/features/notifications/models/notification.schema';

class NotificationServices {
    public async addNotiToDB(noti: INotificationDocument) {
        return await NotificationModel.create(noti);
    }
}

export const notiService = new NotificationServices();
