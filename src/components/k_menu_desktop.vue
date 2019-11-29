<template lang="pug">
div(:style=`{width: width+'px'}`).column.full-height.bg-primary
  //- dialogs
  q-dialog(ref="inviteDialog" :maximized="true" transition-show="slide-left" transition-hide="slide-right")
    k-invite(@hide="$refs.inviteDialog.hide()")
  k-dialog-bottom(ref="logoutDialog" mode="actions" :options="logoutDialogOptions" @action="logoutDialogAction")
  //- kalpagramma
  div(:style=`{height: '60px'}`).row.full-width.cursor-pointer.bg-secondary
    div(@click="$go('/app/home')").col.row.items-center
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        k-logo(:width="40" :height="40")
      div(v-if="!mini").col.full-height
        .row.fit.items-center
          span.text-bold.text-white Кальпаграмма
    div(@click="$go('/app/settings')" :style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="settings" color="white")
  //- user
  div(:style=`{height: '60px'}` @click="$go(`/app/user/` + $store.state.auth.user.oid)").row.full-width.bg-secondary
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      img(:src="$store.state.auth.user.thumbUrl" :style=`{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden'}`)
    div(v-if="!mini").col.full-height
      .row.fit.items-center
        span.text-bold.text-white {{ $store.state.auth.user.name }}
  //- create node
  div(v-if="!page" :style=`{height: '60px'}` @click="$store.commit('ui/stateSet', ['nodeCreatorDialogOpened', true])").row.full-width.items-center.cursor-pointer
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round push icon="add" color="accent")
    div(v-if="!mini").col.full-height
      .row.fit.items-center
        span.text-white Создать ядро
  //- body
  .col.full-width.scroll.bg-secondary
    .row.full-width.items-start.content-start
      div(v-for="(p, pi) in pages" :key="pi" @click="pageClick(p, pi)"
        :style=`{height: '60px'}`
        ).row.full-width.cursor-pointer
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          q-btn(round flat :icon="p.icon" color="white")
        div(v-if="!mini").col.full-height
          .row.fit.items-center
            span.text-white {{ $t(p.name) }}
    div(:class="{'q-px-md': !mini}").row.full-width.items-center.justify-center.q-my-sm
      q-btn(
        :round="mini" push color="accent" no-caps icon="person_add" @click="$go('/app/invite')"
        :style=`mini ? {} : {height: '60px', borderRadius: '10px'}`).full-width
        span(v-if="width === 230").text-bold.q-ml-md {{ $t('Invite friend') }}
  //- footer mini
  div(v-if="!page" :style=`{height: '60px'}`).row.full-width.items-center.br
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat :icon="mini ? 'keyboard_arrow_right' : 'keyboard_arrow_left'" color="white" @click="mini = !mini")
</template>

<script>
export default {
  name: 'kMenuDesktop',
  props: ['page'],
  data () {
    return {
      width: 230,
      mini: false,
      pages: [
        {name: 'Trends', icon: 'whatshot', path: '/app/trends'},
        {name: 'Workspace', icon: 'img:statics/icons/anvil.svg', path: '/app/workspace'},
        {name: 'Subscriptions', icon: 'subscriptions', path: '/app/subscriptions'},
        {name: 'Notifications', icon: 'notifications', path: '/app/notifications'},
        {name: 'Выйти', icon: 'exit_to_app', path: '/app/logout'}
      ]
    }
  },
  computed: {
    logoutDialogOptions () {
      return {
        header: false,
        headerName: '',
        actions: {
          stay: {name: 'Если хочешь остаться, останься просто так'}
        },
        confirm: true,
        confirmName: 'Выйти'
      }
    }
  },
  watch: {
    mini: {
      handler (to, from) {
        let w = 0
        if (to) w = 60
        else w = 230
        this.$tween.to(this, 0.3, {width: w})
        // this.$emit('width', w)
      }
    },
    width: {
      handler (to, from) {
        this.$emit('width', to)
      }
    }
  },
  methods: {
    async logoutDialogAction (action) {
      this.$log('logoutDialogAction', action)
      switch (action) {
        case 'confirm': {
          await this.$store.dispatch('auth/logout')
        }
      }
    },
    async pageClick (p, pi) {
      this.$log('pageClick', p, pi)
      switch (p.path) {
        case '/app/logout': {
          this.$log('LOGOUT')
          this.$refs.logoutDialog.show()
          break
        }
        default: {
          this.$go(p.path)
        }
      }
    }
  }
}
</script>
