<<<<<<< HEAD
<template lang="pug">
q-layout(view="hHh lpR fFf" :container="true" :style=`{width: width+'px', height: height+'px'}`).bg-grey-3
  q-header()
    div(:style=`{height: '60px'}`).row.full-width.items-center.bg-primary
      div(:style=`{height: '60px', width: '60px'}` @click="mainPage()").row.items-center.justify-center
        q-btn(round flat color="white" icon="arrow_back")
      .col.full-height
        .row.fit.items-center.q-pb-xs
          span.text-bold.text-white {{ $t(settings) }}
      //- div(:style=`{height: '60px', width: '60px'}` @click="right = !right").row.items-center.justify-center
        q-btn(round flat color="black" icon="menu")
  //- q-drawer(v-model="right" side="right" :width="200")
    div(style=`height: 60px; border: 1px solid #eee`).row.full-width.justify-start.items-center.bg-grey-1.q-px-md
      span.text-bold Settings
    div(:style=`{width: '200px'}`).row.full-height.items-start.content-start.bg-grey-1
      div(
        v-for="(p, pkey) in pages" :key="pkey" @click="pageClick(p, pkey)"
        :style=`{height: '50px'}`
        ).row.full-width.items-center.cursor-pointer.q-px-md
          span(:style=`{color: pkey === page ? '#789dff' : 'black'}`) {{ $t(p.name) }}
  q-page-container
    q-page
      div(:style=`{height: height-60+'px'}`).row
        .col.full-height
          notifications(v-if="page === 'notifications'")
          account(v-if="page === 'account'")
          security(v-if="page === 'security'")
          //- payments(v-if="page === 'payments'")
          privacy(v-if="page === 'privacy'")
          blacklist(v-if="page === 'blacklist'")
          information(v-if="page === 'information'")
          //- div(v-else).row.fit.items-center.justify-center
            span.text-bold 404
          div(v-if="page === 'settings'" :style=`{}`).row.full-height.items-start.content-start.bg-grey-1.q-pt-sm
            div(
              v-for="(p, pkey) in pages" :key="pkey" @click="pageClick(p, pkey)"
              :style=`{height: '50px'}`
              ).row.full-width.items-center.cursor-pointer.q-px-md
                .row.justify-center.items-center
                  q-icon(size="30px" color="accent" :name="p.icon")
                .col.q-ml-sm.items-center
                  span(:style=`{color: pkey === page ? '#789dff' : 'black'}`) {{ $t(p.name) }}
  q-footer()
    div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width
      k-menu-mobile
</template>

<script>
import account from './account'
import payments from './payments'
import privacy from './privacy'
import security from './security'
import notifications from './notifications'
import information from './information'
import blacklist from './blacklist'
export default {
  name: 'pageApp__settings',
  components: {information, blacklist, account, payments, privacy, security, notifications},
  props: ['width', 'height'],
  data () {
    return {
      page: 'settings',
      right: true,
      pages: {
        notifications: {name: 'Notifications', icon: 'notifications'},
        account: {name: 'Account', icon: 'perm_identity'},
        // security: {name: 'Security', icon: 'security'},
        privacy: {name: 'Privacy', icon: 'pan_tool'},
        // payments: {name: 'Payments and Subscriptions'},
        blacklist: {name: 'Black list', icon: 'view_list'},
        information: {name: 'Information', icon: 'info'}
      }
    }
  },
  computed: {
    settings () {
      if (this.page === 'notifications') return 'Notifications'
      if (this.page === 'account') return 'Account'
      if (this.page === 'security') return 'Security'
      if (this.page === 'privacy') return 'Privacy'
      // if (this.page === 'payments') return 'Payments'
      if (this.page === 'blacklist') return 'Black list'
      if (this.page === 'information') return 'Information'
      else return 'Settings'
    }
  },
  methods: {
    mainPage () {
      if (this.page !== 'settings') {
        this.page = 'settings'
      } else this.$router.back(1)
    },
    pageClick (p, pkey) {
      this.$log('pageClick', p, pkey)
      this.page = pkey
      this.right = !this.right
    }
  }
}
</script>
=======
<template lang="pug">
q-layout(view="hHh lpR fFf" :container="true" :style=`{width: width+'px', height: height+'px'}`).bg-grey-3
  q-header()
    div(:style=`{height: '60px'}`).row.full-width.items-center.bg-primary
      div(:style=`{height: '60px', width: '60px'}` @click="mainPage()").row.items-center.justify-center
        q-btn(round flat color="white" icon="arrow_back")
      .col.full-height
        .row.fit.items-center.q-pb-xs
          span.text-bold.text-white {{ $t(settings) }}
      //- div(:style=`{height: '60px', width: '60px'}` @click="right = !right").row.items-center.justify-center
        q-btn(round flat color="black" icon="menu")
  //- q-drawer(v-model="right" side="right" :width="200")
    div(style=`height: 60px; border: 1px solid #eee`).row.full-width.justify-start.items-center.bg-grey-1.q-px-md
      span.text-bold Settings
    div(:style=`{width: '200px'}`).row.full-height.items-start.content-start.bg-grey-1
      div(
        v-for="(p, pkey) in pages" :key="pkey" @click="pageClick(p, pkey)"
        :style=`{height: '50px'}`
        ).row.full-width.items-center.cursor-pointer.q-px-md
          span(:style=`{color: pkey === page ? '#789dff' : 'black'}`) {{ $t(p.name) }}
  q-page-container
    q-page
      div(:style=`{height: height-60+'px'}`).row
        .col.full-height
          notifications(v-if="page === 'notifications'")
          account(v-if="page === 'account'")
          security(v-if="page === 'security'")
          //- payments(v-if="page === 'payments'")
          privacy(v-if="page === 'privacy'")
          blacklist(v-if="page === 'blacklist'")
          information(v-if="page === 'information'")
          //- div(v-else).row.fit.items-center.justify-center
            span.text-bold 404
          div(v-if="page === 'settings'" :style=`{}`).row.full-height.items-start.content-start.bg-grey-1.q-pt-sm
            div(
              v-for="(p, pkey) in pages" :key="pkey" @click="pageClick(p, pkey)"
              :style=`{height: '50px'}`
              ).row.full-width.items-center.cursor-pointer.q-px-md
                .row.justify-center.items-center
                  q-icon(size="30px" color="accent" :name="p.icon")
                .col.q-ml-sm.items-center
                  span(:style=`{color: pkey === page ? '#789dff' : 'black'}`) {{ $t(p.name) }}
</template>

<script>
import account from './account'
import payments from './payments'
import privacy from './privacy'
import security from './security'
import notifications from './notifications'
import information from './information'
import blacklist from './blacklist'
export default {
  name: 'pageApp__settings',
  components: {information, blacklist, account, payments, privacy, security, notifications},
  props: ['width', 'height'],
  data () {
    return {
      page: 'settings',
      right: true,
      pages: {
        notifications: {name: 'Notifications', icon: 'notifications'},
        account: {name: 'Account', icon: 'perm_identity'},
        // security: {name: 'Security', icon: 'security'},
        privacy: {name: 'Privacy', icon: 'pan_tool'},
        // payments: {name: 'Payments and Subscriptions'},
        blacklist: {name: 'Black list', icon: 'view_list'},
        information: {name: 'Information', icon: 'info'}
      }
    }
  },
  computed: {
    settings () {
      if (this.page === 'notifications') return 'Notifications'
      if (this.page === 'account') return 'Account'
      if (this.page === 'security') return 'Security'
      if (this.page === 'privacy') return 'Privacy'
      // if (this.page === 'payments') return 'Payments'
      if (this.page === 'blacklist') return 'Black list'
      if (this.page === 'information') return 'Information'
      else return 'Settings'
    }
  },
  methods: {
    mainPage () {
      if (this.page !== 'settings') {
        this.page = 'settings'
      } else this.$router.back(1)
    },
    pageClick (p, pkey) {
      this.$logD('pageClick', p, pkey)
      this.page = pkey
      this.right = !this.right
    }
  }
}
</script>
>>>>>>> 89bf613b3a17b556258d93f8d603c1cdd832734d
