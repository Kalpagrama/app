<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  @scroll="onScroll").b-30
  q-header(
   ).b-30
    .row.full-width.justify-center
      //- q-resize-observer(@resize="onResize")
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.items-start.content-start.full-width
        .row.full-width.q-pa-sm
          div(
            :style=`{
              height: '60px',
              borderRadius: '10px',
            }`
            ).row.full-width.items-center.content-center.q-pa-sm.b-40
            q-btn(
              @click="$router.back()"
              round flat color="white" icon="keyboard_arrow_left")
            q-btn(
              round flat color="white" icon="filter_tilt_shift")
            .col.q-px-sm
              span.text-white.text-bold Ядро
            kalpa-menu-actions(:actions="actions" icon="more_vert")
        list-middle(
          v-if="node"
          rootMargin="-30% 0px"
          :items="[node]" :itemStyles=`{marginTop: '0px',}`)
          template(v-slot:item=`{item,itemIndex,isActive:itemActive,isVisible: itemVisible}`)
            node-feed(
              v-if="node"
              :node="node" :isActive="itemActive" :isVisible="itemVisible")
        node-mockup(
          v-if="!node && $store.state.core.progressInfo.CREATE[$route.params.oid]"
          :value="$store.state.core.progressInfo.CREATE[$route.params.oid]"
          :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`)
  q-page-container
    component(
      v-if="node"
      :is="`page-${pageId}`" :node="node" :pageHeight="$q.screen.height-headerHeight-50")
      template(v-slot:bottom)
        .row.full-width.justify-center
          div(:style=`{maxWidth: 770+'px'}`).row.full-width
            q-btn(round flat dense color="grey-8" icon="keyboard_arrow_left" @click="$router.back()" no-caps).q-ml-sm.q-mr-lg Назад
            .col
              q-tabs(
                v-model="pageId"
                align="justify"
                no-caps active-color="green").full-width.text-grey-8
                q-tab(v-for="p in pages" :key="p.id" :name="p.id" :label="p.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeMockup from './node_mockup/index.vue'

export default {
  name: 'pageApp_node',
  components: {
    nodeMockup,
    // pageInside: () => import('./view_joints/index.vue'),
    pageInside: () => import('./page_inside/index.vue'),
    // pageOutside: () => import('./page_outside/index.vue'),
    contentPlayer: () => import('components/content_player/index.vue')
  },
  data () {
    return {
      node: null,
      nodeOpened: true,
      pageId: 'inside',
      headerHeight: 0,
      headerWidth: 0,
      mounted: false,
    }
  },
  computed: {
    pages () {
      return [
        {id: 'inside', name: 'Ядра'},
        {id: 'outside', name: 'Связи'}
      ]
    },
    actions () {
      return {
        report: {
          name: 'Пожаловаться',
          cb: () => {
            this.$log('nodeReport...')
          }
        }
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          if (this.$store.state.core.progressInfo.CREATE[to]) {
            this.$log('CREATE intital', this.$store.state.core.progressInfo.CREATE[to])
            this.nodeWatch(to)
          }
          else {
            this.$log('LOADING NODE...')
            this.nodeLoad(to)
          }
        }
      }
    },
    pageId: {
      handler (to, from) {
        if (to && to === 'outside') {
          this.nodeOpened = false
        }
      }
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.headerHeight = e.height
      this.headerWidth = e.width
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      if (this.nodeOpened && this.mounted) this.nodeOpened = false
    },
    nodeWatch (oid) {
      this.$log('nodeWatch', oid)
      var unwatch = this.$watch(
        '$store.state.core.progressInfo.CREATE',
        (valOld, valNew) => {
          if (valNew) {
            this.$log('CREATE valOld/valNew', valOld, valNew[oid])
            if (valNew[oid] === 100) {
              this.$q.notify({
                type: 'positive',
                position: 'top',
                message: this.$t('wsNodeEditor_nodeSendToPublication', 'Ядро готово!')
              })
              this.nodeLoad(oid)
              unwatch()
              this.$store.commit('core/stateSet', ['progressInfo', {UPLOAD: {}, CREATE: {}}])
            }
          }
          else {
            if (unwatch) unwatch()
          }
        },
        {
          immediate: true,
          deep: true
        }
      )
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad', oid)
      this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, oid)
    }
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(2000)
    this.mounted = true
    // this.$store.commit('ui/stateSet', ['pageWidth', this.$q.screen.width - 140])
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    // this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    // this.$store.commit('ui/stateSet', ['pageWidth', this.$store.state.ui.pageWidthDefault])
    // this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
