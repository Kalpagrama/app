<template lang="pug">
div(
  v-if="sphere"
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  //- create btn
  q-btn(
    round color="green" icon="add_link" size="lg"
    :style=`{
      position: 'fixed', zIndex: 10000,
      right: '30px',
      bottom: '30px',
      //- bottom: 'calc(env(safe-area-inset-bottom) + 10px)',
      borderRadius: '50%',
    }`)
  //- header
  //- sphere + spheres close
  .row.full-width.justify-center
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width.items-start.content-start.justify-center.q-pa-sm
      q-btn(
        round flat color="white" icon="west"
        @click="$routerKalpa.back()")
      .col.full-height
        .row.full-width.justify-center
          span(:style=`{fontSize: '22px',}`).text-white.text-bold {{ sphere.name }}
      q-btn(
        round flat color="white" icon="more_vert"
        @click="sphereActionsShow = true")
  //- fragments slider
  div(
    v-if="sphereNodes"
    ).row.full-width.scroll
    .row.full-width.items-start.content-start.justify-center
      .row.full-width.justify-center.no-wrap
        div(
          v-for="(node,nodeIndex) in sphereNodes.items" :key="node.oid"
          :style=`{
            position: 'relative',
            maxWidth: $store.state.ui.pageWidth+'px',
            //- minWidth: $store.state.ui.pageWidth+'px',
          }`
          ).row.full-width.items-start.content-start
          //- item wrapper
          div(
            v-observe-visibility=`{
              throttle: 150,
              callback: nodeVisibilityCallback
            }`
            ).row.full-width.items-start.content-start
            node-feed(
              :node="node.populatedObject"
              :isActive="nodeIsVisible"
              :isVisible="nodeIsVisible"
              :showName="false"
              )
          //- item links
          item-links(
            :oid="node.populatedObject.oid"
            @loaded="itemLinksLoaded = true"
            @empty="itemLinksEmpty = true")
          div(
            v-if="itemLinksEmpty"
            ).row.full-width
            h1.text-white Empty
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import itemLinks from './item_links/index.vue'

export default {
  name: 'pageApp_sphereFull',
  components: {
    itemLinks,
  },
  data () {
    return {
      sphere: null,
      sphereActionsShow: false,
      sphereNodes: null,
      itemLinksLoaded: false,
      itemLinksEmpty: false,
      nodeIsVisible: false,
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.sphere?.oid
        },
        populateObjects: true,
      }
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('$route.params.oid TO', to)
          this.sphere = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          this.sphereNodes = await this.$rxdb.find(this.query, true)
        }
      }
    },
  },
  methods: {
    nodeVisibilityCallback (isVisible, entry) {
      this.nodeIsVisible = isVisible
    }
  },
  created () {
    this.$log('created')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
