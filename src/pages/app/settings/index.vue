<template lang="pug">
q-layout
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.items-center.bg-white
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat color="black" icon="menu")
      .col.full-height
        .row.fit.items-center.q-px-md
          span.text-bold Settings
  q-page-container
    .row.fit.bg-white
      h1 settings
</template>

<script>
import kMenu from 'pages/app/menu'

export default {
  name: 'pageApp__Settings',
  components: {kMenu},
  data () {
    return {
      menuShow: false,
      menuItems: [
        {id: 'general', name: 'Основные'},
        {id: 'security', name: 'Безопасность'},
        {id: 'privacy', name: 'Приватность'},
        {id: 'notifications', name: 'Уведомления'},
        {id: 'payments', name: 'Плетежи и подписки'}
      ],
      menuItem: null
    }
  },
  methods: {
    menuItemClick (m, mi) {
      this.$log('menuItemClick', m, mi)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
