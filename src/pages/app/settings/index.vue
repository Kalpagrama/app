<template lang="pug">
.column.fit.bg-white
  //- header
  div(
    @click="userClick"
    style=`height: 100px; borderBottom: 1px solid #eee; paddingLeft: 20px`).row.items-center.full-width
    //- optimistic UI
    div(v-if="!$store.state.auth.user").row.full-width
      div(style=`height: 45px; width: 45px; borderRadius: 50%`).row.items-center.justify-center.bg-grey-2
      .col
        .row.fit.content-center.q-px-sm
          div(style=`height: 20px; minHeight: 20px; borderRadius: 4px; width: 250px`).row.bg-grey-2.q-mb-xs
          div(style=`height: 18px; minHeight: 18px; borderRadius: 4px; width: 130px`).row.bg-grey-2
    //- user info
    div(v-else).row.full-width
      div(style=`height: 45px; width: 45px; borderRadius: 50%`).row.items-center.justify-center.bg-grey-2
      .col
        .row.fit.content-center.q-px-sm
          .row.full-width
            span {{ $store.state.auth.user.name }}
          .row.full-width
            small {{ $store.state.auth.user.oid }}
  //- body
  .col.scroll
    div(v-for="(s, si) in settings" :key="si"
      style=`height: 50px`).row.full-width.items-center.q-px-md.hr.cursor-pointer
      div(style=`height: 50px; width: 50px`).row.items-center.justify-center
        q-icon(:name="s.icon" size="30px" color="grey")
      span {{ s.name }}
    div(@click="refresh").row.full-width.items-center.q-px-md.hr.cursor-pointer
      div(style=`height: 50px; width: 50px`).row.items-center.justify-center
        q-icon(name="refresh" size="30px" color="grey")
      span Обновить кэш
    div(@click="$router.push('/login')").row.full-width.items-center.q-px-md.hr.cursor-pointer
      div(style=`height: 50px; width: 50px`).row.items-center.justify-center
        q-icon(name="power_off" size="30px" color="grey")
      span Выйти
</template>

<script>
export default {
  name: 'pageAppSettings',
  data () {
    return {
      setting: null,
      settings: [
        {id: 'nodes', name: 'Мои ядра', icon: 'menu'},
        {id: 'spheres', name: 'Мои сферы', icon: 'menu'},
        {id: 'bookmarks', name: 'Закладки', icon: 'bookmark'},
        {id: 'profile', name: 'Профиль', icon: 'menu'},
        {id: 'journal', name: 'Бортовой журнал', icon: 'menu'},
        {id: 'stories', name: 'Истории', icon: 'menu'},
        {id: 'weekly', name: 'Лучшее за неделю', icon: 'menu'},
        {id: 'settings', name: 'Настройки', icon: 'settings'}
      ]
    }
  },
  methods: {
    userClick () {
      this.$log('userClick')
    },
    settingClick (s) {
      this.$log('settingClick', s)
      this.$set(this, 'setting', s)
    },
    refresh () {
      this.$log('refresh')
      window.location.reload(true)
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
