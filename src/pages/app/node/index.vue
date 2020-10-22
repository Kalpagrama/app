<style lang="sass">
.sphere-item
  &:hover
    background: rgb(60,60,60) !important
</style>

<template lang="pug">
q-layout(view="hHh Lpr lff")
  //- position="bottom"
  q-dialog(
    v-model="nodeConnectOpened"
    transition-show="none"
    transition-hide="none"
    @before-show="nodeActive = false, $store.commit('ui/stateSet', ['showMobileNavigation', false])"
    @before-hide="nodeActive = true, $store.commit('ui/stateSet', ['showMobileNavigation', true])")
    div(
      :style=`{
        maxWidth: $store.state.ui.pageMaxWidth+'px',
        minHeight: $q.screen.gt.sm ? $q.screen.height/2+'px' : $q.screen.height+'px',
        borderRadius: '10px',
      }`
      ).row.full-width.items-start.content-start.b-30
      kalpa-connect(
        v-if="node"
        :oid="node.oid"
        @close="nodeConnectOpened = false")
        div(
          :style=`{
            borderRadius: '10px'
          }`
          ).row.full-width.b-40
          img(
            draggable="false"
            :src="node.thumbUrl"
            :style=`{
              height: '80px',
              borderRadius: '10px', overflow: 'hidden',
            }`)
          .col
            .row.fit.items-start.content-start.q-pa-md
              span.text-white.text-bold {{ node.name }}
  q-header(reveal)
    .row.full-width.justify-center.q-px-sm.q-pt-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        div(:style=`{height: '60px',borderRadius: '10px', overflow: 'hidden',}`
          ).row.full-width.items-center.content-center.b-40.q-pa-sm
          q-btn(
            v-if="$q.screen.width > $store.state.ui.pageMaxWidth+140"
            @click="$router.back()"
            round flat color="white" icon="keyboard_arrow_left")
          q-icon(name="filter_tilt_shift" color="white" size="30px").q-mx-sm.q-my-xs
          div(:style=`{overflowX: 'auto'}`).col
            span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ node ? node.name : '' }}
          kalpa-follow(v-if="node" :oid="$route.params.oid")
  q-page-container
    q-page(:style=`{paddingTop: '8px', paddingBottom: '0px'}`)
      .row.full-width.items-start.content-start.justify-center
        //- node items
        div(v-if="node").row.full-width.items-start.content-start
          div(
            v-if="['PIP', 'VERTICAL', 'SLIDER'].includes(node.layout)"
            ).row.full-width.items-start.content-start.justify-center
            div(
              :style=`{
                maxWidth: $store.state.ui.pageMaxWidth+'px',
                borderRadius: '10px',
                background: 'rgb(35,35,35)'
              }`
              ).row.full-width
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
              //- node body
              div(
                :style=`{
                  maxWidth: $store.state.ui.pageMaxWidth+'px',
                  borderRadius: '10px', overflow: 'hidden',}`
                ).row.full-width.b-40
                list-middle(
                  rootMargin="-30% 0px"
                  :items="node.items" :itemStyles=`{marginTop: '0px',}`)
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
                //- node name
                div(
                  :style=`{
                    textAlign: 'center',
                  }`
                  ).row.full-width.items-start.content-start.justify-center.q-pa-md
                  span(:style=`{fontSize: '18px'}`).text-white.text-bold.shaking.cursor-pointer {{ node.name }}
                //- node description
                .row.full-width
                  span.text-white {{ node.description }}
              //- node actions
              view-spheres(:node="node")
            node-actions(v-if="node" :node="node" :isActive="true" :isVisible="true").q-mb-xs
        //- node is creating, wait...
        .row.full-width.justify-center
          node-mockup(
            v-if="!node && $store.state.core.progressInfo.CREATE[$route.params.oid]"
            :value="$store.state.core.progressInfo.CREATE[$route.params.oid]"
            :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`)
        .row.full-width.justify-center
          div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
            router-view(v-if="node" :node="node" @nodesLoaded="nodesLoaded = true")
      q-page-sticky(
        v-if="node"
        position="bottom right" :offset="[0, 70]"
        :style=`{zIndex: 5555}`)
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          q-btn(
            v-if="true"
            @click="nodeConnectOpened = true"
            no-caps color="green" icon="link" size="md")
            span.text-white.text-bold.q-ml-sm {{ $t('Connect node', 'Связать ядро') }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { date } from 'quasar'
import { shareWith } from 'src/system/services'

import nodeMockup from './node_mockup/index.vue'

export default {
  name: 'pageApp__node',
  components: {
    nodeMockup,
    compositionPlayer: () => import('components/composition/composition_player/index.vue'),
    nodeActions: () => import('components/node/node_actions.vue'),
    viewSpheres: () => import('./view_spheres/index.vue'),
    viewJoints: () => import('./view_joints/index.vue'),
    viewConnect: () => import('./view_connect/index.vue'),
  },
  data () {
    return {
      node: null,
      nodeActive: true,
      nodeVisible: true,
      nodeCategories: [],
      nodeConnectOpened: false,
      nodesLoaded: false,
    }
  },
  computed: {
    createdAt () {
      if (this.node) {
        return date.formatDate(this.node.createdAt, 'DD.MM.YYYY')
      }
      return ''
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
      // this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
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
