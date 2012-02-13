var servers = {
  node1: {
    address: 'http://sc2tv.ru/notifications',
    port: 8080,
    queues: [
      {
        name: 'admin',
        dataPort: 9999
      }, {
        name: 'stream',
        notificationsPort: 9001
      }
    ]
  },
  node2: {
    address: 'http://localhost',
    port: 8081,
    queues: [
      {
        name: 'admin'
      }
    ]
  }
};

module.exports = servers;