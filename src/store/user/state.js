export default {
  initialized: false,
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
  },
  user: {
    name: '',
    thumbUrl: '',
    weightVal: 0.001,
    profile: {
      city: '',
      country: '',
      dateBirth: '',
      gender: '',
      lang: '',
      nameFirst: '',
      nameFull: '',
      nameSecond: '',
    }
  }
}
