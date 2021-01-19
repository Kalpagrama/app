<template lang="pug">
.row.full-width.justify-center
  //- header
  div(
    :style=`{
      position: 'fixed', zIndex: 2000,
      top: '0px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        position: 'relative',
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width.items-start.content-start.q-pt-xs.q-px-xs
      q-resize-observer(@resize="onResizeHeader" :debounce="300")
      img(
        draggable="false"
        :src="item.thumbUrl"
        :style=`{
          borderRadius: '10px',
          maxHeight: $q.screen.width*0.7+'px',
          objectFit: 'contain',
        }`
        ).full-width.b-40
  //- footer
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="!joint && !jointCreating"
      :style=`{
        position: 'fixed', zIndex: 1000,
        bottom: '0px',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          //- height: '70px',
          borderRadius: '10px 10px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }`
        ).row.full-width.b-40
        div().row.full-width.justify-between.q-pa-sm
          q-btn(
            @click="$routerKalpa.back()"
            round flat icon="west" color="white")
          q-btn(
            @click="jointCreating = true"
            round flat icon="fas fa-link" color="green")
          q-btn(
            round flat icon="more_vert" color="white")
  //- joint current
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="joint"
      :style=`{
        position: 'fixed', zIndex: 1000,
        top: headerHeight+'px',
        height: $q.screen.height-headerHeight+'px',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }`
        ).row.full-width.b-30
        joint-current(
          :item="item"
          :joint="joint"
          :height="$q.screen.height-headerHeight"
          :style=`{
          }`
          @close="joint = null").b-30
  //- joint creator
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="jointCreating"
      :style=`{
        position: 'fixed', zIndex: 1000,
        top: headerHeight+'px',
        height: $q.screen.height-headerHeight+'px',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }`
        ).row.full-width.b-30
        joint-creator(
          :item="item"
          :height="$q.screen.height-headerHeight"
          :style=`{
          }`
          @close="jointCreating = false").b-30
  //- page
  div(
    :style=`{
      position: 'relative',
      paddingTop: headerHeight+'px',
      paddingBottom: $q.screen.height-headerHeight+'px',
      opacity: (joint || jointCreating) ? 0 : 1,
    }`
    ).row.full-width.justify-center
    //- page
    div(
      :style=`{
        position: 'relative',
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width
      joints-gallery(
        :oid="item.oid"
        :height="$q.screen.height-headerHeight"
        @joint="joint = $event"
        @create="jointCreating = true"
        )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'viewGallery',
  props: ['item'],
  components: {
    jointCreator: () => import('./joint_creator/index.vue'),
    jointCurrent: () => import('./joint_current/index.vue'),
    jointsGallery: () => import('./joints_gallery/index.vue'),
  },
  data () {
    return {
      joint: null,
      jointCreating: false,
      joints: [],
      headerHeight: 0,
      headerWidth: 0,
    }
  },
  computed: {
  },
  watch: {
    item: {
      handler (to, from) {
        this.$log('item TO', to)
        if (this.joint) {
          this.joint = null
          this.jointCreating = false
          this.joints = []
        }
      }
    }
  },
  methods: {
    onResizeHeader (e) {
      this.headerHeight = e.height
      this.headerWidth = e.width
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
