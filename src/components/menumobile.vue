<template lang="pug">
div(:style=`{}`).column.fit.bg-grey-2
  q-dialog(ref="inviteDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    pageInvite(@hide="$refs.inviteDialog.hide()")
  .col
    q-item(clickble v-ripple :to="`/app/user`" :style=`{height: '70px'}` @click="pageClick('/app/user')").row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        img(@click="$router.push(`/app/user/${$store.state.auth.user.oid}`)"
          :src="$store.state.auth.user ? $store.state.auth.user.thumbUrl : ''" style=`width: 40px; height: 40px; borderRadius: 50%; overflow: hidden`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400;`) {{ $store.state.auth.user ? $store.state.auth.user.name : ''}}
    q-item(clickble :to="`/app/hot`" @click="pageClick('/app/hot')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="whatshot" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) В тренде
    q-item(clickble :to="`/app/create`" @click="pageClick('/app/create')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="add" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Создать ядро
    q-item(clickble :to="`/`" @click="pageClick('/')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="subscriptions" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Подписки
    q-item(clickble :to="`/`" @click="pageClick('/')"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="notifications" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Уведомления
    q-item(clickable @click="$refs.inviteDialog.show()"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="person_add" color="primary" style=`fontSize: 30px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`) Пригласить друга
    q-item(clickble :to="`/`" @click="logout()"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="exit_to_app" color="primary" style=`fontSize: 30px`)
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
