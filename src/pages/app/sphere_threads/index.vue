<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :container="false"
  :style=`{
    height: $q.screen.height+'px',
  }`).b-30
  //- item creator
  q-dialog(
    v-model="itemCreatorShow"
    :maximized="true"
    position="bottom")
    item-creator(
      @close="itemCreatorShow = false")
  //- create btn
  transition(enter-active-class="animated slideInDown" leave-active-class="animated slideOutDown")
    q-btn(
      v-if="!itemCreatorShow"
      round color="green" icon="add_link" size="lg"
      :style=`{
        position: 'fixed', zIndex: 10000,
        right: '30px',
        bottom: '30px',
        //- bottom: 'calc(env(safe-area-inset-bottom) + 10px)',
        borderRadius: '50%',
      }`
      @click="itemCreatorShow = true")
  q-page-container
    q-page(v-if="sphere")
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
          .row.full-width.items-start.content-start.justify-center.no-wrap
            div(
              v-for="(node,nodeIndex) in sphereNodes.items" :key="node.oid"
              :style=`{
                position: 'relative',
                maxWidth: $store.state.ui.pageWidth+'px',
                //- minWidth: $store.state.ui.pageWidth+'px',
                paddingBottom: $q.screen.height/2+'px',
              }`
              ).row.full-width.items-start.content-start
              //- item wrapper
              div(
                v-observe-visibility=`{
                  throttle: 150,
                  callback: nodeVisibilityCallback
                }`
                ).row.full-width.items-start.content-start
                item-feed(
                  :itemShortOrFull="node.populatedObject"
                  :isActive="nodeIsVisible"
                  :isVisible="nodeIsVisible"
                  :showName="false"
                  )
              //- item links
              item-links(
                :oid="node.populatedObject.oid"
                @loaded="itemLinksLoaded = true"
                @empty="itemLinksEmpty = true")
              //- item links empty!
              div(
                v-if="itemLinksEmpty"
                ).row.full-width.items-center.content-center.justify-center.q-pa-xl
                span.text-white No links here, be first one!
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import itemLinks from './item_links/index.vue'
import itemCreator from './item_creator/index.vue'

export default {
  name: 'pageApp_sphereFull',
  components: {
    itemLinks,
    itemCreator,
  },
  data () {
    return {
      sphere: null,
      sphereActionsShow: false,
      sphereNodes: null,
      itemLinksLoaded: false,
      itemLinksEmpty: false,
      nodeIsVisible: false,
      itemCreatorShow: false,
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
          this.sphereNodes = await this.$rxdb.find(this.query)
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
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
