<template lang="pug">
div(:style=`{}`).column.fit.bg-grey-2
  q-dialog(ref="inviteDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    pageInvite(@hide="$refs.inviteDialog.hide()")
  .col
    q-item(clickable v-ripple :to="`/app/user`" :style=`{height: '70px'}` @click="pageClick('/app/user')").row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        img(@click="$router.push(`/app/user/${$store.state.auth.user.oid}`)"
          :src="$store.state.auth.user ? $store.state.auth.user.thumbUrl : ''" style=`width: 40px; height: 40px; borderRadius: 50%; overflow: hidden`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400;`) {{ $store.state.auth.user ? $store.state.auth.user.name : ''}}
    q-item( v-ripple v-for="(p, pp) in pages" :key="p.id" :to="p.path" @click="pageClick(p.path)"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(:name="p.icon" color="primary" style=`fontSize: 25px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) {{p.name}}
    q-item(clickable @click="$refs.inviteDialog.show()"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="person_add" color="primary" style=`fontSize: 25px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Пригласить друга
    q-item(clickable :to="`/`" @click="logout()"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="exit_to_app" color="primary" style=`fontSize: 25px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Выйти
</template>
<script>
import pageInvite from 'pages/app/invite'
export default {
  name: 'menumobile',
  components: { pageInvite },
  data () {
    return {
      pages: [
        {name: 'В тренде', icon: 'whatshot', path: '/app/hot'},
        {name: 'Создать ядро', icon: 'add', path: '/app/create'},
        {name: 'Подписки', icon: 'subscriptions', path: '/app/subscriptions'},
        {name: 'Уведомления', icon: 'notifications', path: '/app/notifications'}
      ]
    }
  },
  methods: {
    show () {
      this.$refs.inviteDialog.show()
    },
    async pageClick (path) {
      this.$log('pageClick', path)
      this.$root.$emit('toggle_menu')
      await this.$wait(200)
      this.$router.push(path)
    },
    async logout () {
    this.$log('logout')
    await this.$apollo.mutate({
     mutation: gql`
          mutation logout {
            logout
          }
        `
    })
    localStorage.removeItem('ktoken')
    localStorage.removeItem('ktokenExpires')
    localStorage.removeItem('ktokenInviteCode')
    this.$router.push('/login')
    }
  }
}
</script>
