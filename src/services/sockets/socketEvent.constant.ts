export enum SocketEventList {
    sendMessage = 'SendMessage',
    sendNotification = 'NotiSent',
    broadcastNotification = 'Broadcast',
    onSetupChatRoom = 'SetupChatRoom',
    sendSocketRequestError = 'SocketRequestError',
    onTyping = 'OnTyping',
    responseTyping = 'ReponseTyping',
    sendSeenStatus = 'OnSeenMessage',
    sendOnlineState = 'SendOnlineState',
    handleUserLogout = 'handleUserLogout',
    onSetupNotification = 'SetupNotification',
    handleUserConnect = 'handleUserConnect',
}
