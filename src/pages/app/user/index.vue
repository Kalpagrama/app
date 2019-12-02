<template lang="pug">
div(:style=`{height: 'calc(var(--vh, 1vh) * 100)'}`).row.full-width.bg-grey-4
  k-dialog-bottom(ref="userSettingsDialog" mode="actions" :options="userSettingsDialogOptions" @action="userSettingsAction")
  .row.full-width.content-start
    //- header
    div(:style=`{height: '100px'}`).row.full-width.bg-primary
      .row.items-start
        q-btn(round @click="$router.back(1)" flat color="white" icon="arrow_back")
      .col
      .row
        .row.full-width.justify-end
          q-btn(round flat @click="$refs.userSettingsDialog.show()" color="white" icon="more_vert")
        //- .row.full-width.justify-end.items-end.q-pb-sm.q-px-sm
          q-btn(@click="" rounded no-caps dense style=`height: 30px` color="grey" icon="").q-px-md Edit profile
    //- body
    .row.full-width.bg-grey-1.q-px-sm
      .row.full-width
        img(:src="$store.state.auth.user.thumbUrl" :style=`{width: '80px', height: '80px', marginTop: '-40px', borderRadius: '50%', overflow: 'hidden'}`)
        .col.row.justify-end.q-mt-sm
          q-btn(rounded dense no-caps :color="subscriptions.includes(this.oid) ? 'accent' : 'red'").q-px-md Follow
      .row.full-width.items-center.justify-start
        .row
          span.text-bold.text-black.text-h6 {{ user.name }}
        .row
          .row.full-width
            small.text-grey Деятель искуства
          .row.full-width.q-mt-xs
            small There is no shame, there is no conscien and anything superfluos.
      .row.justify-start.items-center.q-mt-sm.q-py-sm
        //- Количество созданых ядер
        div(style=`height: 50px`).row.justify-center.items-center
          .row.full-width.justify-center
            small.text-h6.text-bold 0
          .row.full-width.justify-center
            small.text-grey.text-bold  Nodes
        //- Количество подписчиков
        div(style=`width: 60px; height: 50px`).row.justify-center.items-center
          .row.full-width.justify-center
            span.text-h6.text-bold 2
          .row.full-width.justify-center
            small.text-grey.text-bold Followers
        //- Количество подписок
        div(style=`width: 60px; height: 50px`).row.justify-center.items-center
          .row.full-width.justify-center
            span.text-h6.text-bold 2
          .row.full-width.justify-center
            small.text-grey.text-bold  Following
    .row.full-width.justify-center
      user-nodes(v-if="page === 'nodes' && user" :user="user")
      //- WTF???
      //- //- account actions
      //- user-nodes(v-if="page === 'nodes' && user" :user="user")
      //- div(v-else).row.fit.q-pt-md
      //-   div(:style=`{borderRadius: '20px', overflow: 'hidden'}`).row.fit.items-start.content-start.bg-white.q-pa-sm
      //-     h4 {{ pages[page].name }}
    div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width
      k-menu-mobile
</template>

<script>
import userNodes from './user_nodes'
import userChains from './user_chains'
import userSettings from './user_settings'
import userWorkspace from './user_workspace'

export default {
  name: 'pageApp__User',
  components: {userNodes, userChains, userSettings, userWorkspace},
  data () {
    return {
      user: null,
      page: 'nodes'
    }
  },
  computed: {
    subscriptions () {
      return this.$store.state.subscriptions.userSubscriptions
    },
    userSettingsDialogOptions () {
      return {
        confirm: false,
        actions: {
          edit: {name: 'Edit'},
          share: {name: 'Share'},
          copy: {name: 'Copy Url'},
          block: {name: 'Block'},
          report: {name: 'Report', color: 'red'}
        }
      }
    },
    pages () {
      return {
        nodes: {name: 'Ядра'},
        collections: {name: 'Коллекции'},
        settings: {name: 'Настройки'}
      }
    }
  },
  watch: {
    '$route': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.params.oid) {
          this.$log('GOT USER OID', to.params.oid)
          this.user = await this.userLoad(to.params.oid)
          this.page = 'nodes'
        } else {
          this.$log('NO USER OID!')
          this.$router.push({params: {oid: this.$store.state.auth.user.oid}})
        }
      }
    }
  },
  methods: {
    userSettingsAction (a) {
      this.$log('userSettingsAction', a)
      switch (a) {
        case 'report': {
          break
        }
        case 'block': {
          break
        }
        case 'copy': {
          break
        }
        case 'share': {
          break
        }
        case 'edit': {
          break
        }
      }
    },
    // async subscribers () {
    //   let res = await this.$store.dispatch('objects/get', { oid, fragmentName: 'userFragment', priority: 0 })
    //   this.$log('res', res)
    // },
    async followUser () {
      let res = await this.$store.dispatch('subscriptions/subscribe', this.user.oid)
      this.$log('res', res)
    },
    async userLoad (oid) {
      this.$log('userLoad start')
      let user = await this.$store.dispatch('objects/get', { oid, fragmentName: 'userFragment', priority: 0 })
      // return user
      // let {data: {userLoad: [user]}} = await this.$apollo.query({
      //   query: gql`
      //     query userLoad ($oid: OID!) {
      //       objectList(oids: [$oid]) {
      //         oid
      //         type
      //         name
      //         thumbUrl(preferWidth: 50)
      //         createdAt
      //       }
      //     }
      //   `,
      //   variables: {
      //     oid
      //   }
      // })
      this.$log('userLoad done', user)
      return user
    },
    pageClick (p) {
      this.$log('pageClick', p)
      this.$router.push({params: {page: p.id}})
    },
    pageBtnClass (p) {
      if (this.page) {
        return {
          'bg-grey-5': this.page.id === p.id,
          'text-white': this.page.id === p.id
        }
      }
    },
    menuAddClick (a, ai) {
      this.$log('menuAddClick')
      switch (a.id) {
        case 'node': {
          this.$router.push('/app/create/node')
          break
        }
        case 'chain': {
          this.$router.push('/app/create/chain')
          break
        }
      }
    },
    avatarError (e) {
      // this.$log('avatarError', e)
      e.target.src = 'statics/logo.png'
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
