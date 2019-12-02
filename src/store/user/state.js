export default {
  initialized: false,
  user: {
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
      nameSecond: '',
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
  }
}
