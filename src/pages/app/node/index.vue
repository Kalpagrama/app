<style lang="sass">
.sphere-item
  &:hover
    background: rgb(60,60,60) !important
</style>

<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-dialog(
    v-model="nodeLinkerOpened" position="bottom"
    @before-show="nodeActive = false, $store.commit('ui/stateSet', ['showMobileNavigation', false])"
    @before-hide="nodeActive = true, $store.commit('ui/stateSet', ['showMobileNavigation', true])")
    node-linker(v-if="node" :node="node" @close="nodeLinkerOpened = false")
  q-header(reveal)
    .row.full-width.justify-center.q-px-sm.q-pt-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        div(:style=`{height: '60px',borderRadius: '10px', overflow: 'hidden',}`
          ).row.full-width.items-center.content-center.b-40.q-px-sm
          q-btn(
            @click="$router.back()"
            round flat color="white" icon="keyboard_arrow_left")
          q-icon(name="filter_tilt_shift" color="white" size="30px").q-mr-sm.q-my-xs
          div(:style=`{overflowX: 'auto'}`).col
            //- span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ $t('Node', 'Ядро') }}
            span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ node ? node.name : '' }}
          kalpa-follow(v-if="node" :oid="$route.params.oid")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '400px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(v-if="node").row.full-width
          //- SLIDER
          //- div(
            v-if="node.layout === 'SLIDER'"
            :style=`{
              position: 'relative',
              borderRadius: '10px', overflow: 'hidden',
            }`).row.full-width.items-start.content-start
            list-slider(:items="node.items")
              template(v-slot:item=`{item, isActive: itemActive}`)
                div(
                  :style=`{
                    position: 'relative',
                    borderRadius: '10px', overflow: 'hidden',
                  }`
                  ).row.fit.b-40.shadow-5
                  composition-player(
                    :composition="item" :isVisible="true" :isActive="nodeActive && itemActive"
                    :options=`{height: '100%', objectFit: 'cover', loop: true}`)
            .row.full-width.justify-center
              div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.justify-center.cursor-pointer.q-pa-md
                span(:style=`{fontSize: '18px'}`).text-white.text-bold.shaking.cursor-pointer {{ node.name }}
          //- PIP, VERTICAL
          div(
            v-if="['PIP', 'VERTICAL', 'SLIDER'].includes(node.layout)"
            ).row.full-width.items-start.content-start.justify-center
            //- node author
            .row.full-width.justify-center
              div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-center.content-center.q-pa-sm
                q-btn(
                  :to="'/user/'+node.author.oid"
                  flat color="white" dense no-caps
                  )
                  user-avatar(:url="node.author.thumbUrl" :width="24" :height="24")
                  span.text-grey-4.q-ml-sm {{ node.author.name }}
                .col
                small.text-grey-8.q-mr-xs {{ node.countViews }}
                q-icon(name="visibility" color="grey-8").q-mr-md
                small.text-grey-8.q-mr-sm {{ $date(node.createdAt, 'DD.MM.YYYY') }}
            div(
              :style=`{
                maxWidth: $store.state.ui.pageMaxWidth+'px',
                borderRadius: '10px', overflow: 'hidden',}`
              ).row.full-width.b-40.q-px-sm
              list-middle(
                rootMargin="-30% 0px"
                :items="node.items" :itemStyles=`{marginTop: '16px',}`)
                template(v-slot:item=`{item,itemIndex,isActive:itemActive,isVisible: itemVisible}`)
                  div(
                    :style=`{
                      position: 'relative',
                      borderRadius: '10px', overflow: 'hidden',
                    }`
                    ).row.full-width
                    composition-player(
                      :composition="item" :isVisible="itemVisible" :isActive="nodeActive && itemActive"
                      :options=`{height: 'auto', objectFit: 'contain', loop: true}`)
              //- node spheres
              //- div(
                v-if="node"
                :style=`{
                  maxWidth: $store.state.ui.pageMaxWidth+'px',
                  position: 'relative',
                }`
                ).row.full-width.items-center.content-center.q-pt-sm
                //- node category goes as first sphere
                router-link(
                  v-if="category"
                  :to="'/sphere/'+category.sphere.oid"
                  :style=`{height: '40px',borderRadius: '10px'}`
                  ).row.items-center.content-center.q-px-sm.bg-blue.q-mr-sm.q-mb-sm.shaking
                  q-icon(name="blur_on" color="white" size="20px").q-mr-xs
                  span.text-white.q-mr-md {{ category.alias }}
                //- node spheres
                router-link(
                  v-for="(s,si) in node.spheres" :key="s.oid" :to="'/sphere/'+s.oid"
                  :style=`{height: '40px',borderRadius: '10px'}`
                  ).row.items-center.content-center.q-px-sm.b-50.sphere-item.q-mr-sm.q-mb-sm
                  q-icon(name="blur_on" color="white" size="20px").q-mr-xs
                  span.text-white.q-mr-md {{ s.name }}
              //- node name
              .row.full-width.items-start.content-start.justify-center.q-py-md
                span(:style=`{fontSize: '18px'}`).text-white.text-bold.shaking.cursor-pointer {{ node.name }}
              //- node description
              .row.full-width
                span.text-white {{ node.description }}
        div(
                v-if="node"
                :style=`{
                  maxWidth: $store.state.ui.pageMaxWidth+'px',
                  position: 'relative',
                }`
                ).row.full-width.items-center.content-center.q-pt-sm.q-px-sm
                //- node category goes as first sphere
                router-link(
                  v-if="category"
                  :to="'/sphere/'+category.sphere.oid"
                  :style=`{height: '40px',borderRadius: '10px'}`
                  ).row.items-center.content-center.q-px-sm.bg-blue.q-mr-sm.q-mb-sm.shaking
                  q-icon(name="blur_on" color="white" size="20px").q-mr-xs
                  span.text-white.q-mr-md {{ category.alias }}
                //- node spheres
                router-link(
                  v-for="(s,si) in node.spheres" :key="s.oid" :to="'/sphere/'+s.oid"
                  :style=`{height: '40px',borderRadius: '10px'}`
                  ).row.items-center.content-center.q-px-sm.b-50.sphere-item.q-mr-sm.q-mb-sm
                  q-icon(name="blur_on" color="white" size="20px").q-mr-xs
                  span.text-white.q-mr-md {{ s.name }}
        node-actions(v-if="node" :node="node" :isActive="true" :isVisible="true")
        //- node is creating, wait...
        .row.full-width.justify-center
          node-mockup(
            v-if="!node && $store.state.core.progressInfo.CREATE[$route.params.oid]"
            :value="$store.state.core.progressInfo.CREATE[$route.params.oid]"
            :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`)
        .row.full-width.justify-center.q-pt-xl
          div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
            router-view(v-if="node" :node="node" @nodesLoaded="nodesLoaded = true")
      q-page-sticky(
        v-if="node"
        position="bottom" :offset="[0, 60]"
        :style=`{zIndex: 5555}`)
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          q-btn(
            v-if="true"
            @click="$router.push('/workspace/link/new?oid='+node.oid)"
            no-caps color="green" icon="insert_link" size="md")
            span.text-white.text-bold.q-ml-sm {{ $t('Link node', 'Связать ядро') }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { date } from 'quasar'
import { shareWith } from 'src/system/services'

import nodeMockup from './node_mockup/index.vue'
import nodeLinker from './node_linker/index.vue'

export default {
  name: 'pageApp__node',
  components: {
    nodeMockup,
    nodeLinker,
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    nodeActions: () => import('components/node/node_actions.vue')
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
    // this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    // this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    // this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
