<style lang="stylus">
.q-header {
  // background: none !important;
}
</style>
<template lang="pug">
.row.full-width.justify-center.bg-grey-3
  q-layout(view="hHh lpR fFf" :container="true" :style=`{height: '100vh', width: $q.screen.width+'px'}` @resize="onResize" @scroll="onScroll").bg-grey-3
    q-footer(reveal).bg-grey-3
      .row.full-width.justify-center
        div(:style=`{height: '60px', maxWidth: '500px'}`).row.full-width.items-center.justify-between.q-px-sm
          q-btn(no-caps round flat color="grey" icon="clear" @click="$emit('close')")
          q-btn(push no-caps :loading="nodePublishing" color="green" @click="nodePublish()"
            :style=`{borderRadius: '10px'}`)
            span.text-white {{$t('Publish')}}
    q-header(
      v-if="showNameSticky"
      ).row.full-width.justify-center.q-px-sm.bg-grey-3
      div(:style=`{maxWidth: '500px'}`).row.full-width.q-px-sm.q-pt-sm
        div(:style=`{height: '60px', borderRadius: '10px 10px 0 0', overflow: 'hidden', }`).row.full-width.items-center.justify-center.bg-white
          span.text-bold.text-black {{ node.name }}
    q-page-conainter
      .row.full-width.justify-center.items-start.content-start
        div(:style=`{maxWidth: '500px'}`).row.full-width.items-start.content-start.q-pa-sm
          .row.full-width.items-start.content-start
            node(
              :width="width" :node="node" :nodeFullReady="node"
              @previewLoaded="previewHeight = $event").bg-white.q-mb-md
          .row.full-width
            div(:style=`{borderRadius: '10px', oveflow: 'hidden'}`).row.full-width.bg-white
              //- div(:style=`{height: '60px'}`).row.full-width actions {{ previewHeight }}
              div(:style=`{minHeight: '60px'}`).row.full-width.q-pa-md
                div(:style=`{height: '60px'}`).row.full-width.items-center
                  span.text-bold {{ $t('Spheres') }}
                  .col
                  q-btn(round flat icon="add" color="green")
                .row.full-width.items-start.content-start
                  div(
                    v-for="(s,si) in 100" :key="si"
                    :style=`{borderRadius: '4px'}`).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm
                    small {{$t('Sphere')}} {{si}}
              div(:style=`{minHeight: '60px'}`).row.full-width.q-pa-md
                div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
                  span.text-bold {{ $t('Categories') }}
                  .col
                  q-btn(round flat icon="add" color="green")
                .row.full-width.items-start.content-start
                  div(
                    v-for="(s,si) in 6" :key="si"
                    :style=`{borderRadius: '4px'}`).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm
                    small {{$t('Category') {{si}}
            div(:style=`{height: '70px'}`).row.full-with.br
</template>

<script>
export default {
  name: 'ncSave',
  props: ['node'],
  data () {
    return {
      width: 0,
      nodePublishing: false,
      nodePublishingError: null,
      nodeSaving: false,
      nodeSavingError: null,
      showNameSticky: false,
      previewHeight: 0
    }
  },
  methods: {
    onScroll (e) {
      // this.$log('onScroll', e)
      if (this.previewHeight > 0 && e.position >= this.previewHeight) {
        this.showNameSticky = true
      } else {
        this.showNameSticky = false
      }
    },
    onResize (e) {
      this.width = e.width
    }
  },
  mounted () {
    this.$log('mounted', this.node)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
