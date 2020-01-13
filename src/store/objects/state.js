export default {
  initialized: false,
  // // кэш загруженных объектов {oid: {fragment1: {}, fragment2:{}}}
  // objects: {},
  // ttls: [], // отсортированные данные по времени жизни объектов в кэше{ttl, oid}. сортирвка по ttl
  // currentUser: {
  //   oid: '',
  //   name: '',
  //   thumbUrl: '',
  //   subscribers: [],
  //   weightVal: 0.001,
  //   profile: {
  //     tutorial: false, // показать туториал
  //     // data url, в котором хранится аватарка. Нужно для того, чтобы при смене аватарки - быстро показались данные (objectShort.thumbUrl может быть закэширован на CDN или иным сервером статики и меняется долго)
  //     // на сфере пользователя сначала показывать эту картинку, и если пусто, то стандарный objectShort.thumbUrl
  //     thumbUrl: null,
  //     lang: 'RUS',
  //     role: 'MEMBER',
  //     email: '123@321.ru',
  //     phone: '79263334455',
  //     gender: 'MALE',
  //
  //     city: '',
  //     country: '',
  //     dateBirth: '',
  //
  //     nameFirst: '',
  //     nameFull: '',
  //     nameSecond: ''
  //   },
  //   settings: {
  //     contentSettings: {
  //       autoplay: true
  //     },
  //     security: {
  //       sessions: []
  //     },
  //     privacy: {},
  //     notifications: {
  //       showInstantNotifications: true,
  //       enableSoundNotifications: true,
  //       eventFilter: [],
  //       emailNotificationFilter: true,
  //       pauseAllNotifications: true,
  //       assessmentsNotifications: true,
  //       subscriptionsNotifications: true,
  //       mentionsNotifications: true,
  //       sharedNotifications: true,
  //       nodeCreatedNotifications: true,
  //       nodeAddedNotifications: true
  //     },
  //     blackList: {}
  //   }
  // },
  queryInProgress: false

}
