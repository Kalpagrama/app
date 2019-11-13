<template lang="pug">
.column.fit.bg-secondary
  q-dialog(ref="inviteDialog" transition-show="slide-up" transition-hide="slide-down")
    k-invite(@hide="$refs.inviteDialog.hide()")
  q-item(clickble v-ripple :to="`/app/home`" :style=`{height: '80px'}` @click="pageClick('/app/home')").row.full-width.items-center.q-px-sm.logo
    //- q-btn(round flat color="grey-6" :style=`{overflow: 'hidden'}`)
    //-   template(v-slot:default)
    //-     img(:src="`statics/logo.png`" style=`width: 40px; height: 40px`)
    q-item-section(avatar)
      q-btn(round flat color="primary")
        div(style=`width: 60px; height: 60px`)
          k-logo
    q-item-section.col.q-px-sm
      span(style=`fontWeight: 700`).text-white Кальпаграмма
  .col
    q-item(clickable v-ripple :to="`/app/user`" :style=`{height: '70px'}` @click="pageClick('/app/user')").row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        img(@click="$router.push(`/app/user/${$store.state.auth.user.oid}`)"
          :src="$store.state.auth.user ? $store.state.auth.user.thumbUrl : ''" style=`width: 40px; height: 40px; borderRadius: 50%; overflow: hidden`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400;`).text-white {{ $store.state.auth.user ? $store.state.auth.user.name : ''}}
    q-item(clickable v-ripple v-for="(p, pp) in pages" :key="p.id" :to="p.path" @click="pageClick(p.path)"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(:name="p.icon" color="white" style=`fontSize: 25px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`).text-white {{p.name}}
    q-item(clickable v-ripple @click="$refs.inviteDialog.show()"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="person_add" color="white" style=`fontSize: 25px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`).text-white Пригласить друга
    q-item(clickable v-ripple :to="`/`" @click="$refs.logoutDialog.show()"
      :style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
      q-item-section(avatar)
        q-btn(round flat color="primary")
          q-icon(name="exit_to_app" color="white" style=`fontSize: 25px`)
      q-item-section.col.q-px-sm
        span(style=`fontWeight: 400`).text-white Выйти
</template>

<script>
export default {
  name: 'kMenuVert',
  props: ['mini', 'loading'],
  data () {
    return {
      pages: [
        {name: 'В тренде', icon: 'whatshot', path: '/app/hot'},
        {name: 'Мастерская', icon: 'img:statics/icons/anvil.svg', path: '/app/workspace'},
        {name: 'Создать ядро', icon: 'add', path: '/app/create'},
        {name: 'Подписки', icon: 'subscriptions', path: '/app/subscriptions'},
        {name: 'Уведомления', icon: 'notifications', path: '/app/notifications'},
        {name: 'Настройки', icon: 'settings', path: '/app/settings'}
      ]
    }
  },
  methods: {
    show () {
      this.$refs.inviteDialog.show()
      this.$refs.logoutDialog.show()
    },
    drawerClick (e) {
      // if in "mini" state and user
      // click on drawer, we switch it to "normal" mode
      if (this.miniState) {
        this.miniState = false
        // notice we have registered an event with capture flag;
        // we need to stop further propagation as this click is
        // intended for switching drawer to "normal" mode only
        e.stopPropagation()
      }
    },
    menuToggle () {
      this.$log('menuToggle')
    },
    async pageClick (path) {
      this.$log('pageClick', path)
      // this.$root.$emit('toggle_menu')
      await this.$wait(200)
      this.$router.push(path)
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
<style lang="stylus">
.mini-slot
  transition: background-color .28s
  &:hover
    background-color: rgba(0, 0, 0, .04)
.mini-icon
  font-size: 1.718em

  & + &
    margin-top: 18px
</style>
