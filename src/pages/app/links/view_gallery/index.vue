<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-footer(
    v-if="!joint && !jointCreating"
    reveal
    :style=`{
      paddingBottom: 'env(safe-area-inset-bottom)'
    }`)
    .row.full-width.items-center.content-center.justify-center.q-pa-sm
      div(
        :style=`{
          background: 'rgb(40,40,40)',
          borderRadius: '20px',
          maxWidth: '400px',
        }`).row.full-width.justify-between.q-pa-sm
          q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
          q-btn(
            @click="jointCreating = true"
            color="green" icon="add"
            :style=`{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
            }`)
          q-btn(round flat color="white" icon="more_vert")
  q-page-container
    q-page(
      :style=`{
        paddingTop: 'calc(8px + env(safe-area-inset-top))',
        paddingBottom: '300px',
      }`
      ).row.full-width.justify-center.q-px-sm
      div(
        :style=`{
          maxWidth: 600+'px',
        }`).row.full-width.items-start.content-start
        //- current item... TODO: height ???
        div(:style=`{position: 'relative'}`).row.full-width
          node-items-item(
            :item="item"
            :itemOpened="false"
            :itemActive="true"
            :styles=`{
              height: '300px',
            }`)
        //- gallery
        div(v-if="!joint && !jointCreating").row.full-width.q-mb-xl
          joints-gallery(
            :item="item" :oid="item.oid"
            :height="$q.screen.height-headerHeight"
            @joint="joint = $event"
            @create="jointCreating = true")
        //- current
        div(v-if="joint").row.full-width
          joint-current(
            :item="item"
            :joint="joint.populatedObject"
            :height="$q.screen.height-headerHeight"
            :style=`{
            }`
            @create="joint = null, jointCreating = true"
            @close="joint = null").b-30
        //- creating
        div(v-if="jointCreating").row.full-width.q-mb-xl
          joint-creator(
            :item="item"
            :height="$q.screen.height-headerHeight"
            :style=`{
            }`
            @close="jointCreating = false").b-30
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import jointCreator from './joint_creator/index.vue'
import jointCurrent from './joint_current/index.vue'
import jointsGallery from './joints_gallery/index.vue'
import nodeItemsItem from 'components/node_feed/node_items_item.vue'

export default {
  name: 'viewGallery',
  props: ['item'],
  components: {
    jointCreator,
    jointCurrent,
    jointsGallery,
    nodeItemsItem,
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
