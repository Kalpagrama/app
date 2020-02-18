<template lang="pug">
q-layout(view="hHh lpR fFf" :style=`{height: $q.screen.height+'px'}`)
  //- wsPage dialog for mobile
  q-dialog(v-model="pageDialogOpened" :maximized="true")
    div(:style=`{position: 'relative'}`).row.fit.bg-grey-10
      q-btn(
        round flat color="green" icon="keyboard_arrow_left" @click="pageDialogOpened = false"
        :style=`{position: 'fixed', zIndex: 10000, left: '16px', top: '16px', background: 'rgba(0,0,0,0.2)'}`)
      ws-page(:value="item")
  q-page-container.row.fit.full-width.bg-black
    ws-menu(
      ctx="workspace"
      :oid="node ? node.oid : false" :page="$route.params.page"
      @page="$router.push({params: {page: $event}}).catch(e=>e)" @item="itemClick" @add="itemAdd").bg-grey-9
    //- wsPage for desktop
    div(v-if="$q.screen.gt.xs").col.full-height.bg-grey-10.gt-xs
      ws-page(:value="item")
</template>

<script>
import wsMenu from './ws_menu'
import wsPage from './ws_page'

export default {
  name: 'workspaceIndex',
  components: {wsMenu, wsPage},
  props: [],
  data () {
    return {
      pageDialogOpened: false,
      item: null
    }
  },
  computed: {
  },
  watch: {
    '$route.params.page': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.page CHANGED', to)
        if (to) {
          if (to !== from) {
            this.item = null
            this.$router.replace('/workspace/' + to).catch(e => e)
          }
        } else {
          this.$router.push({params: {page: 'nodes'}})
        }
      }
    }
  },
  methods: {
    itemAdd () {
      this.$log('itemAdd')
      this.$router.push('/workspace/' + this.$route.params.page)
        .then(() => {
          this.item = null
          if (this.$q.screen.xs) this.pageDialogOpened = true
        })
        .catch(e => {
          this.item = null
          if (this.$q.screen.xs) this.pageDialogOpened = true
        })
    },
    async itemClick (item) {
      this.$log('itemClick', item)
      this.$router.push({params: {oid: item.oid}})
        .then(() => {
          this.item = item
          if (this.$q.screen.xs) this.pageDialogOpened = true
        })
        .catch(e => {
          this.item = item
          if (this.$q.screen.xs) this.pageDialogOpened = true
        })
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
