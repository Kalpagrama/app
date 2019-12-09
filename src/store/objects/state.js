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
      lang: 'RUS',
      role: 'MEMBER',
      email: '123@321.ru',
      phone: '79263334455',
      gender: 'MALE',

      city: '',
      country: '',
      dateBirth: '',

      nameFirst: '',
      nameFull: '',
      nameSecond: ''
    },
    settings: {
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
