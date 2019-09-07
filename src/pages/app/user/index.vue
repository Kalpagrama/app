<template lang="pug">
k-page(:name="user ? user.name : ''" :items="pages" @item="page = $event" :item="page")
  template(v-slot:body)
    div(:style=`{position: 'relative', height: $q.screen.gt.sm ? '100vh' : 'calc(100vh - 60px)'}`).column.full-width.q-px-sm.q-py-md
      //- header
      div(v-if="user" style=`height: 100px; borderRadius: 20px`).row.full-width.q-px-sm.bg-white
        //- avatar big
        div(v-if="user" style=`width: 100px`).row.full-height.items-center.justify-center
          img(style=`width: 60px; height: 60px; borderRadius: 50%; oveflow: hidden` @error="avatarError"
            :src="user.thumbUrl[0]").row.bg-grey-3
        .col
          .row.fit.items-center.content-center
            h6.text-bold.q-ma-xs {{user.name}}
            //- account actions
            div(v-if="true" style=`height: 40px`).row.full-width.items-center
              q-btn(v-if="true" icon="add" no-caps color="primary" style=`borderRadius: 10px`) Пригласить друга
              //- share menu
              q-btn(v-if="false" round flat color="grey-6" no-caps icon="share").q-mr-xs
                q-menu(auto-close)
                  div(style=`width: 240px`).row
                    div(style=`height: 50px`).row.full-width.items-center.q-px-md.hr.cursor-pointer
                      span share user menu
              //- settings
              //- q-btn(v-if="false" round flat color="grey-6" no-caps icon="edit" @click="$router.push({params: {page: 'settings'}})").q-mr-xs
      //- body
      .col.scroll.full-width
        keep-alive
          user-nodes(v-if="page === 'nodes' && user" :user="user")
          div(v-else).row.fit.q-pt-md
            div(:style=`{borderRadius: '20px', overflow: 'hidden'}`).row.fit.items-start.content-start.bg-white.q-pa-sm
              h4 {{ pages[page].name }}
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
          this.$router.replace({params: {oid: this.$store.state.auth.user.oid}})
        }
      }
    }
  },
  methods: {
    async userLoad (oid) {
      this.$log('userLoad start')
      let {data: {objectList}} = await this.$apollo.query({
        query: gql`
          query objectList ($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              thumbUrl(preferWidth: 50)
              createdAt
            }
          }
        `,
        variables: {
          oid
        }
      })
      this.$log('userLoad done', objectList[0])
      return objectList[0]
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
