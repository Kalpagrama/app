export default {
  initialized: false,
  // кэш загруженных объектов {oid: {fragment1: {}, fragment2:{}}}
  objects: {},
  ttls: [], // отсортированные данные по времени жизни объектов в кэше{ttl, oid}. сортирвка по ttl
  currentUser: {
    oid: '',
    name: '',
    thumbUrl: '',
    subscribers: [],
    weightVal: 0.001,
    profile: {
      city: '',
      country: '',
      dateBirth: '',
      gender: '',
      lang: '',
      nameFirst: '',
      nameFull: '',
      nameSecond: ''
    },
    settings: {
      general: {
        language: 'Russian',
        phone: '',
        email: '',
        password: ''
      },
      contentSettings: {
        autoplay: true
      },
      security: {
        sessions: []
      },
      privacy: {},
      notifications: {
        showInstantNotifications: true,
        enableSoundNotifications: true,
        eventFilter: [],
        emailNotificationFilter: true,
      },
      blackList: {}
    }
  },
  queryInProgress: false

}
