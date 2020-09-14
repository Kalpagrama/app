<style lang="sass">
.sphere-item
  &:hover
    background: rgb(40,40,40) !important
</style>

<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-dialog(
    v-model="nodeLinkerOpened" position="bottom"
    @before-show="nodeActive = false, $store.commit('ui/stateSet', ['showMobileNavigation', false])"
    @before-hide="nodeActive = true, $store.commit('ui/stateSet', ['showMobileNavigation', true])")
    node-linker(:node="node" @close="nodeLinkerOpened = false")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        .row.full-width.items-start.content-start
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
          .col
            div(:style=`{borderRadius: '10px',}`
              ).row.full-width.items-center.content-center.justify-between.b-40.q-pa-xs
              .col
                div(@click="headerClick()").row.full-width
                  q-icon(name="filter_tilt_shift" color="white" size="30px").q-mx-sm
                  div(:style=`{overflowX: 'auto'}`).col
                    span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold Ядро
              q-btn(
                flat no-caps
                :to="`/trends/${categoryOid}`"
                :style=`{fontSize: '16px'}`
                ).text-white.text-bold.q-px-sm {{ categoryName }}
              kalpa-follow(v-if="node" :oid="$route.params.oid")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '400px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          //- got node is created!
          node-lite(
            v-if="node" :node="node" :isActive="nodeActive" :isVisible="nodeVisible"
            v-observe-visibility=`{
              callback: nodeVisibilityCallback,
              intersection: {
                threshold: 0.8
              }
            }`)
            template(v-slot:footer)
              div(:style=`{position: 'relative', paddingRight: '80px',}`).row.full-width.items-start.content-start.q-pt-sm
                //- node spheres
                router-link(
                  v-for="(s,si) in node.spheres" :key="s.oid" :to="'/sphere/'+s.oid"
                  :style=`{height: '40px',borderRadius: '10px'}`
                  ).row.items-center.content-center.q-px-sm.b-40.sphere-item.q-mr-sm.q-mb-sm
                  q-icon(name="blur_on" color="white" size="20px").q-mr-xs
                  span.text-white.q-mr-md {{ s.name }}
                //- node link start...
                div(
                  v-if="nodesLoaded"
                  :style=`{
                    position: 'absolute', top: '0px',
                    height: 'calc(100% + 200px)',
                    width: '80px', right: '0px',}`).row.justify-center
                    div(:style=`{height: '100%', width: '1px'}`).bg-green
          //- node is creating, wait...
          node-mockup(
            v-if="!node && $store.state.core.progressInfo.CREATE[$route.params.oid]"
            :value="$store.state.core.progressInfo.CREATE[$route.params.oid]")
          router-view(v-if="node" :node="node" @nodesLoaded="nodesLoaded = true")
      q-page-sticky(
        v-if="node"
        position="bottom" :offset="[0, 60]"
        :style=`{zIndex: 99999}`)
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          q-btn(
            v-if="!nodeLinkerOpened"
            @click="nodeLinkerOpened = true"
            no-caps color="green" icon="insert_link")
            span.text-white.text-bold.q-ml-sm Связать ядро
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { date } from 'quasar'
import { shareWith } from 'src/system/services'

import nodeMockup from './node_mockup/index.vue'
import nodeLinker from './node_linker/index.vue'

export default {
  name: 'pageApp__node',
  components: {nodeMockup, nodeLinker},
  meta () {
    return {
      title: this.node?.name,
    }
  },
  data () {
    return {
      node: null,
      nodeActive: true,
      nodeVisible: true,
      nodeCategories: [],
      nodeLinkerOpened: false,
      nodesLoaded: false,
    }
  },
  computed: {
    views () {
      return [
        {id: 'nodes', name: this.$t('pageApp_node_viewNodes_title', 'Ядра')},
        {id: 'chains', name: this.$t('pageApp_node_viewChains_title', 'Связи')}
      ]
    },
    createdAt () {
      if (this.node) {
        return date.formatDate(this.node.createdAt, 'DD.MM.YYYY')
      }
      return ''
    },
    category () {
      if (!this.node) return null
      return this.nodeCategories.find(c => c.type === this.node.category)
    },
    categoryName () {
      return this.category?.alias
    },
    categoryOid () {
      return this.category?.sphere.oid
    },
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          if (this.$store.state.core.progressInfo.CREATE[to]) {
            this.nodeWatch(to)
          }
          else {
            this.nodeLoad(to)
          }
        }
      }
    },
  },
  methods: {
    headerClick () {
      this.$log('headerClick')
      window.scrollTo(0, 0)
    },
    nodeVisibilityCallback (isVisible, entry) {
      // this.$log('nodeVisibilityCallback', isVisible, entry)
      if (isVisible) {
        this.nodeActive = true
      }
      else {
        this.nodeActive = false
      }
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
      this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
