<template lang="pug">
.row.full-width.justify-center.q-py-md.bg-white
  //- div(style=`borderRadius: 4px`).row.full-width.justify-center.q-px-md.bg-white
  div(v-if="user" style=`height: 180px; maxWidth: 800px`).row.full-width.q-px-sm
    //- avatar big
    div(v-if="$q.screen.width > 500" style=`width: 180px`).row.full-height.items-center.justify-center
      div(style=`width: 100px; height: 100px; borderRadius: 50%`).row.bg-grey-3
    .col
      .row.fit.items-center.content-center
        h6.text-bold.q-ma-sm.q-px-sm {{user.name}}
        //- account actions
        div(style=`height: 40px`).row.full-width.items-center
          //- add menu
          q-btn(round flat color="grey-6" no-caps icon="add").q-mr-xs
            q-popup-proxy(position="bottom" auto-close anchor="bottom right" self="top right")
              div(
                :style=`{maxWidth: $q.screen.width < 451 ? '100%' : '230px'}`
                :class="{'q-pa-md': $q.screen.width <= 450}").row.fit
                div(:style=`{borderRadius: '4px'}`).row.full-width.bg-white
                  div(
                    v-for="(a, ai) in menuAdd" :key="a.id" @click="menuAddClick(a, ai)"
                    :style=`{height: '50px', borderTop: ai === 0 ? 'none' : '1px solid #eee'}`
                    ).row.full-width.items-center.justify-center.q-px-md.hr.cursor-pointer
                    span {{ a.name }}
                //- cancel
                div(v-if="$q.screen.width < 451" :style=`{height: '50px', borderRadius: '4px'}`
                  ).row.full-width.items-center.justify-center.q-mt-sm.q-px-md.bg-grey-1
                  span(:style=`{color: 'red'}`).text-bold {{ $t('Отмена') }}
          //- settings
          q-btn(round flat color="grey-6" no-caps icon="edit" @click="$router.push({params: {page: 'settings'}})").q-mr-xs
          //- share menu
          q-btn(round flat color="grey-6" no-caps icon="share").q-mr-xs
            q-menu(auto-close)
              div(style=`width: 240px`).row
                div(style=`height: 50px`).row.full-width.items-center.q-px-md.hr.cursor-pointer
                  span share user menu
        //- account pages
        div(style=`height: 50px`).row.full-width.items-center
          q-btn(
            v-for="(p, pi) in getPages" :key="p.id" v-if="!p.hidden"
            @click="pageClick(p, pi)"
            :class=`pageBtnClass(p)`
            flat rounded no-caps).q-mr-sm
              span.text-bold {{p.name}}
  //- account pages
  div(v-if="user && page").row.full-width
    keep-alive
      user-settings(v-if="page.id === 'settings'" :user="user")
      user-nodes(v-if="page.id === 'nodes'" :user="user")
      user-chains(v-if="page.id === 'chains'" :user="user")
      user-workspace(v-if="page.id === 'workspace'" :user="user")
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
      page: null,
      menuAdd: [
        {id: 'node', name: 'Создать ядро', icon: ''},
        {id: 'chain', name: 'Создать цепочку', icon: ''}
      ]
    }
  },
  computed: {
    getPages () {
      return [
        {id: 'nodes', name: 'Ядра'},
        {id: 'chains', name: 'Цепочки'},
        {id: 'workspace', name: 'Мастерская', hidden: this.$store.state.auth.user.oid !== this.user.oid},
        {id: 'settings', name: 'Настройки', hidden: true}
      ]
    }
  },
  watch: {
    '$route': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        // load user
        // if (to.params.oid === from.params.oid) return
        if (to.params.oid) {
          if (!this.user) this.user = await this.userLoad(to.params.oid)
          if (to.params.page) {
            let pageFind = this.getPages.find(p => (p.id === to.params.page))
            this.$log('pageFind', pageFind)
            if (pageFind) this.page = pageFind
            // else this.$router.push({params: {page: 'nodes'}})
          } else {
            // this.$router.push({params: {page: 'nodes'}})
          }
        } else {
          this.$log('NO USER OID!')
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
              thumbUrl(preferWidth: 600)
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
