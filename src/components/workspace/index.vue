<template lang="pug">
.column.fit.bg-grey-3
  //- template(v-slot:header)
  div(:style=`{height: '60px'}`).row.full-width.items-center
    //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      //- anvil(:width="30" :height="30")
      q-btn(round flat icon="menu")
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold {{ $t('Workspace') }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="add" @click="$refs.wsAddDialog.show()")
  .col.full-width
    k-colls(@coll="coll = $event" :coll="coll" :colls="colls" :header="false" :tabs="true" :actions="false" :style=`{height: height+'px'}`)
      template(v-slot:actions)
        q-btn(round push color="primary" size="lg" icon="add")
      //- template(v-slot:header)
      template(v-slot:dashboard)
        ws-dashboard
      template(
        v-for="(c, ci) in colls"
        v-slot:[c.id])
        ws-items(:type="c.id" :key="c.id")
      template(v-slot:settings)
        ws-settings
</template>

<script>
import wsItems from './ws_items'
import wsDashboard from './ws_dashboard'
import wsSettings from './ws_settings'

export default {
  name: 'workspace',
  components: {wsItems, wsDashboard, wsSettings},
  props: {
    inFinder: {type: Boolean, default () { return false }},
    width: {type: Number},
    height: {type: Number}
  },
  data () {
    return {
      coll: 'bookmarks',
      colls: [
        {id: 'bookmarks', name: 'Notes'},
        {id: 'fragments', name: 'Fragments'},
        {id: 'drafts', name: 'Drafts'},
        {id: 'spheres', name: 'Spheres'},
        {id: 'settings', name: 'Settings'}
      ]
    }
  },
  computed: {
    wsAddDialogOptions () {
      return {
        confirm: true,
        confirmName: 'Create node',
        actions: {
          addBookmark: {name: 'Add bookmark'},
          addFragment: {name: 'Add fragment'},
          addContent: {name: 'Add sphere'}
        }
      }
    }
  },
  watch: {
    // '$route': {
    //   immediate: true,
    //   handler (to, from) {
    //     if (to.params.page) this.$set(this, 'page', to.params.page)
    //     else {
    //       this.$router.push({params: {page: 'bookmarks'}})
    //     }
    //   }
    // }
  },
  methods: {
    wsAddDialogAction (action) {
      this.$log('wsAddDialogAction', action)
      switch (action) {
        case 'addBookmark': {
          this.$store.commit('ui/stateSet', ['bookmarkDialogOpened', true])
          break
        }
        case 'addContent': {
          // this.$store.commit('ui/stateSet', ['contentDialogOpened', true])
          break
        }
        case 'confirm': {
          // this.$store.commit('')
          // set draft from the memory
          this.$store.commit('ui/stateSet', ['nodeCreatorDialogOpened', true])
          break
        }
      }
    },
    async pageClick (m, mkey) {
      this.$log('pageClick', m, mkey)
      this.$router.push({params: {page: mkey}})
    }
  }
}
</script>

<style lang="stylus">
.q-drawer {
  background: none !important
}
</style>
