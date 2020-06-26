<style lang="sass">
.menu-item
  &:hover
    background: rgb(70,70,70)
</style>

<template lang="pug">
div(
  :style=`{
    borderRadius: $store.state.ui.borderRadius+'px',
  }`).column.full-width.b-50
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" position="bottom"
    @hide="nodeEdited")
    ws-node-editor(
      @close="nodeEdited"
      @published="nodePublished"
      :value="node"
      :style=`{
        maxWidth: '800px',
        maxHeight: $q.screen.height-60+'px',
        minHeight: $q.screen.height-60+'px',
      }`)
  //- header
  div(
    :style=`{height: '100px'}`
    ).row.full-width.items-center.content-center
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      kalpa-logo(:width="40" :height="40")
    .col
      .row.fit.items-center.content-center
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Kalpagramma
        .row.full-width
          small.text-white Up the essence!
  //- body
  div(:style=`{overflowX: 'hidden'}`).col.full-width
    div(
      :style=`{
        borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'
      }`
      ).column.full-width.b-50
        router-link(
          v-if="$store.getters.currentUser()"
          :to="'/user/'+$store.getters.currentUser().oid"
          :class=`{
            'b-100': $route.path.split('/')[1] === 'user'
          }`
          :style=`{height: '60px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
          ).row.full-width.items-center.content-center.menu-item
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
            kalpa-avatar(:url="$store.getters.currentUser().profile.photoUrl" :width="40" :height="40")
          .col.full-height
            .row.fit.items-center.content-center
              span(:style=`{lineHeight: 1.1}`).text-white.text-bold {{$store.getters.currentUser().name}}
              small.text-white.full-width {{ '@'+$store.getters.currentUser().name }}
        router-link(
          v-for="(p,pi) in pages" :key="p.id"
          :to="{name: p.id}"
          :class=`{
            'b-100': $route.path.split('/')[1] === p.id
          }`
          :style=`{
            height: '60px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'
          }`
          ).row.full-width.items-center.menu-item
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat :icon="p.icon" color="white")
          span(:style=`{fontSize: '18px'}`).text-white {{ p.name }}
        //- refresh
        div(
          :style=`{height: '60px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}` @click="refresh()"
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat icon="refresh" color="white" :loading="refreshLoading")
          span(:style=`{fontSize: '18px', userSelect: 'none', pointerEvents: 'none'}`).text-white Refresh
        //- logout
        div(
          :style=`{height: '60px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}` @click="logout()"
          ).row.full-width.items-center.content-center.menu-item.cursor-pointer
          div(:style=`{height: '50px', width: '60px'}`).row.items-center.content-center.justify-center
            q-btn(round dense flat icon="power_off" color="white" :loading="logoutLoading")
          span(:style=`{fontSize: '18px', userSelect: 'none', pointerEvents: 'none'}`).text-white Logout
        //- create node
        div(
          v-if="true"
          :style=`{}`
          ).row.full-width.items-center.content-center
          q-btn(
            @click="createNodeStart()"
            color="green" no-caps align="left" icon="add"
            :style=`{height: '50px'}`).full-width
            span(:style=`{fontSize: '18px'}`).q-ml-md Create node
        //- version
        div(v-if="true").row.full-width.items-center.q-pa-md
          small(:style=`{marginLeft: '6px'}`).text-grey-6 Version: 0.9.9-26.06.2020
        //- slot(name="footer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { AuthApi } from 'src/api/auth'

export default {
  name: 'kalpaMenu',
  data () {
    return {
      width: 300,
      pages: [
        {id: 'home', name: 'Home', icon: 'home'},
        {id: 'trends', name: 'Trends', icon: 'whatshot'},
        {id: 'workspace', name: 'Workspace', icon: 'school'},
        {id: 'settings', name: 'Settings', icon: 'tune'},
        // {id: 'report', name: 'Report a bug', icon: 'bug_report'}
      ],
      refreshLoading: false,
      logoutLoading: false,
      nodeEditorOpened: false,
      node: null,
    }
  },
  computed: {
  },
  methods: {
    async refresh () {
      this.$log('refresh')
      this.refreshLoading = true
      await this.$wait(1000)
      await this.$rxdb.clearAll()
      // await this.$store.dispatch('cache/clear')
      // window.location.reload(true)
      this.refreshLoading = false
    },
    async logout () {
      this.$log('logout')
      if (!confirm('Really logout ?')) return
      this.logoutLoading = true
      await this.$wait(500)
      await AuthApi.logout()
      this.logoutLoading = false
    },
    async createNodeStart () {
      this.$log('createNodeStart')
      this.$store.commit('ui/stateSet', ['active', false])
      let nodeInput = {
        name: '',
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft'
      }
      this.$log('nodeInput', nodeInput)
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAddStart item', item)
      this.node = item
      this.nodeEditorOpened = true
    },
    nodeEdited () {
      this.$log('nodeEdited')
      this.$store.commit('ui/stateSet', ['active', true])
      this.nodeEditorOpened = false
      this.node = null
    },
    async nodePublished () {
      this.$log('nodePublished')
      this.nodeEdited()
      await this.$wait(200)
      this.$router.push(`/user/${this.$store.getters.currentUser().oid}`).catch(e => e)
    }
  },
}
</script>
