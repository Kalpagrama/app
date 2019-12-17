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
            span.text-bold.text-white {{$t('Кальпаграмма ver ') + $store.state.core.version}}
      div(@click="$go('/app/settings')" :style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat icon="settings" color="white")
    //- user
    div(:style=`{height: '60px'}` @click="$go(`/app/user/` + $store.state.objects.currentUser.oid)").row.full-width.bg-secondary
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        img(:src="$store.state.objects.currentUser.thumbUrl" :style=`{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden'}`)
      div(v-if="!mini").col.full-height
        .row.fit.items-center
          span.text-bold.text-white {{ $t($store.state.objects.currentUser.name) }}
    //- create node
    div(v-if="!page" :style=`{height: '60px'}` @click="$store.commit('ui/stateSet', ['nodeCreatorDialogOpened', true])").row.full-width.items-center.cursor-pointer
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round push icon="add" color="accent")
      div(v-if="!mini").col.full-height
        .row.fit.items-center
          span.text-white {{$t('Создать ядро')}}
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
          :style=`mini ? {} : {height: '50px', borderRadius: '10px'}`).full-width
          span(v-if="width === 230").text-bold.q-ml-md {{ $t('Invite friend') }}
      div(v-if="!this.$store.state.core.installPrompt || true" :class="{'q-px-md': !mini}").row.full-width.items-center.justify-center.q-my-sm
        q-btn(
          :round="mini" push color="accent" no-caps
          :icon="this.$store.state.core.newVersionAvailable ? 'system_update' : 'cloud_download'"
          @click="update"
          :style=`mini ? {} : {height: '50px', borderRadius: '10px'}`).full-width
          span(v-if="width === 230").text-bold.q-ml-md {{ $t(this.$store.state.core.newVersionAvailable ? 'update app' : 'check for updates') }}
      //- v-if="this.$store.state.core.installPrompt"
      div(:class="{'q-px-md': !mini}").row.full-width.items-center.justify-center.q-my-sm
        q-btn(
          :round="mini" push color="accent" no-caps icon="save_alt" @click="install"
          :style=`mini ? {} : {height: '50px', borderRadius: '10px'}`).full-width
          span(v-if="width === 230").text-bold.q-ml-md {{ $t('install_app') }}
    //- footer mini
    div(v-if="!page" :style=`{height: '60px'}`).row.full-width.items-center.br
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat :icon="mini ? 'keyboard_arrow_right' : 'keyboard_arrow_left'" color="white" @click="mini = !mini")
</template>

<script>
  import { checkUpdate } from 'src/system/service_worker'
  import { LogLevelEnum } from 'src/boot/log'

  export default {
    name: 'kMenuDesktop',
    props: ['page'],
    data () {
      return {
        width: 230,
        mini: false,
        pages: [
          { name: 'Trends', icon: 'whatshot', path: '/app/trends' },
          { name: 'Workspace', icon: 'img:statics/icons/anvil.svg', path: '/app/workspace' },
          { name: 'Subscriptions', icon: 'subscriptions', path: '/app/subscriptions' },
          { name: 'Notifications', icon: 'notifications', path: '/app/notifications' },
          // { name: 'test web-push', icon: 'message', path: '/app/test_message' },
          // { name: 'sentry log send', icon: 'message', path: '/app/sentry_log' },
          { name: 'test share', icon: 'share', path: '/app/share' },
          { name: 'Exit', icon: 'exit_to_app', path: '/app/logout' }
        ]
      }
    },
    computed: {
      logoutDialogOptions () {
        return {
          header: false,
          headerName: '',
          actions: {
            stay: { name: 'Отмена' }
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
          if (to) {
            w = 60
          } else {
            w = 230
          }
          this.$tween.to(this, 0.3, { width: w })
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
        this.$logD('logoutDialogAction', action)
        switch (action) {
          case 'confirm': {
            await this.$store.dispatch('auth/logout', localStorage.getItem('ktoken'))
          }
        }
      },
      async pageClick (p, pi) {
        this.$logD('pageClick', p, pi)
        switch (p.path) {
          case '/app/logout':
            this.$logD('LOGOUT')
            this.$refs.logoutDialog.show()
            break
          case '/app/test_message':
            this.$logD('test_message..')
            await this.$store.dispatch('events/testWebPush')
            break
          case '/app/sentry_log':
            this.$logD('sentry_log..')
            await this.$store.commit('core/stateSet', ['logLevelSentry', LogLevelEnum.DEBUG])
            break
          case '/app/share': {
            this.$logD('share..')
            if (!('share' in navigator)) {
              alert('Web Share API not supported.');
            } else {
              navigator.share({
                title: 'test_title',
                text: 'test_text',
                url: 'https://whatwebcando.today/'
              })
                .then(() => console.log('Successful share'))
                .catch(error => this.$logE('Error sharing:', error));
            }
            // http://localhost:8282/share-target/?title=test_title&text=test_text+https%3A%2F%2Fwhatwebcando.today%2F
            // let intent = new Intent('http://webintents.org/share',
            //   'text/uri-list',
            //   'https://whatwebcando.today');
            // navigator.startActivity(intent, function () {
            //   console.log('Successful share')
            // }, function (error) {
            //   console.log('Error sharing:', error);
            // });
            break
          }
          default:
            this.$go(p.path)
        }
      },
      async update () {
        if (this.$store.state.core.newVersionAvailable) {
          this.$store.commit('core/stateSet', ['newVersionAvailable', false])
          this.$logD('updating ...')
          location.reload()
        } else {
          this.$logD('checkUpdate..')
          await checkUpdate()
        }
      },
      async install () {
        let installPrompt = this.$store.state.core.installPrompt
        this.$logD('installPrompt=', installPrompt)
        if (installPrompt) installPrompt.prompt()
      }
    }
  }
</script>
