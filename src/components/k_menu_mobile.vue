<template lang="pug">
.row.full-width
  q-dialog(ref="inviteDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    k-invite(@hide="$refs.inviteDialog.hide()")
  //- user
  q-item(clickable v-ripple :to="`/app/user`" :style=`{height: '70px'}` @click="pageClick('/app/user')").row.full-width.items-center.q-px-sm
    q-item-section(avatar)
      img(@click="$router.push(`/app/user/${$store.state.auth.user.oid}`)"
        :src="$store.state.auth.user ? $store.state.auth.user.thumbUrl : ''" style=`width: 40px; height: 40px; borderRadius: 50%; overflow: hidden`)
    q-item-section.col.q-px-sm
      span(style=`fontWeight: 400;`) {{ $store.state.auth.user ? $store.state.auth.user.name : ''}}
  //- items
  q-item(
    v-for="(p, pp) in pages" :key="p.id" clickable @click="pageClick(p)"
    v-ripple
    :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
    q-item-section(avatar)
      q-btn(round flat color="primary")
        q-icon(:name="p.icon" color="primary" style=`fontSize: 25px`)
    q-item-section.col.q-px-sm
      span(style=`fontWeight: 400`) {{p.name}}
</template>
<script>
export default {
  name: 'kMenuMobile',
  components: {},
  data () {
    return {
      pages: [
        {name: 'В тренде', icon: 'whatshot', path: '/app/hot'},
        {name: 'Создать ядро', icon: 'add', path: '/app/create'},
        {name: 'Уведомления', icon: 'notifications', path: '/app/notifications'},
        {name: 'Subscriptions', icon: 'subscriptions', path: '/app/subscriptions'},
        {name: 'Invite friend', icon: 'person_add', path: false},
        {name: 'Logout', icon: 'power_off', path: false}
      ]
    }
  },
  methods: {
    async pageClick (page) {
      this.$log('pageClick', page)
      if (page.path) {
        this.$router.push(page.path)
      } else {
        switch (page.icon) {
          case 'person_add': {
            this.$refs.inviteDialog.show()
            break
          }
          case 'power_off': {
            this.$refs.logoutDialog.show()
            break
          }
        }
      }
    }
  }
}
</script>
