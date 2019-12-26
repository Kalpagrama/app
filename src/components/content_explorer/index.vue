<style lang="stylus">
.q-header {
  background: none !important;
}
.mejs__playpause-button {
  display: none !important
}
iframe {
  width: 100% !important;
  height: 100% !important;
}
</style>
<template lang="pug">
q-layout(view="hHh lpR fFf" @resize="onResize" @scroll="onScroll").bg-grey-3
  //- q-header(
  //-   v-if="showNameSticky"
  //-   ).row.full-width.justify-center
  //-   .col.bg-grey-3
  //-   div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-px-sm
  //-     div(:style=`{borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.bg-grey-3.q-pt-sm
  //-       div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden', }` @click="headerClick()").row.full-width.items-center.justify-center.bg-white
  //-         span(v-if="node").text-bold.text-black.text-center {{ node.name }}
  //-   .col.bg-grey-3
  q-footer(reveal).row.full-width.justify-center.bg-grey-3
    k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`)
  q-page-conainter
    .row.full-width.justify-center.items-start.content-start
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start.q-pa-sm
          nc-fragment(
            v-if="content" ctx="inEditor" :index="0" :stageFirst="2" :inExplorer="true"
            :fragment="{content: content, cuts: [], name: '', thumbUrl: '', scale: content.type === 'VIDEO' ? content.duration : 100}")
      div(
        v-if="true"
        :style=`{marginBottom: '1000px'}`).row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pa-sm
          //- content nodes header
          div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.justify-center.bg-white.q-mt-xl.q-mb-sm
            span.text-center {{ $t('Similar nodes') }}
          //- similar nodes list
          node-loader(ref="nodeLoader" :variables="variables" type="sphereNodes")
            template(v-slot:default=`{nodes}`)
              node-list(:nodes="nodes" :nodesBan="[]" @nodeClick="nodeClick")
</template>

<script>
import ncFragment from 'components/node_composer/nc_fragment'

export default {
  name: 'contentExplorer',
  components: {ncFragment},
  props: [],
  data () {
    return {
      width: 0,
      content: null,
      showNameSticky: false,
      previewHeight: 0
    }
  },
  computed: {
    variables () {
      return {
        oid: this.$route.params.oid
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.$log('$route CHANGED', to.params.oid)
          this.content = await this.contentLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    nodeClick (val) {
      this.$log('nodeClick', val)
      this.$router.push('/node/' + val[0].oid)
    },
    async contentLoad (oid) {
      this.$log('contentLoad start')
      let content = await this.$store.dispatch('objects/get', { oid, fragmentName: 'objectFragment', priority: 0 })
      return content
    },
    headerClick () {
      this.$log('headerClick')
      this.$tween.to(document.documentElement, 0.3, {scrollTop: 0})
    },
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
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
