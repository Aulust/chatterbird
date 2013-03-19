module.exports = {
    port: 10000,
    queues: {
        'admin': {
            domainName: '127.0.0.1',
            listenPort: 6666
        },
        'notifications': {
            notificationsPort: 4444
        }
    }
};
