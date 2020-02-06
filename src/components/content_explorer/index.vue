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
q-layout(view="hHh lpR fFf").bg-grey-3
  //- q-header(
  //-   v-if="showNameSticky"
  //-   ).row.full-width.justify-center
  //-   .col.bg-grey-3
  //-   div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-px-sm
  //-     div(:style=`{borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.bg-grey-3.q-pt-sm
  //-       div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden', }` @click="headerClick()").row.full-width.items-center.justify-center.bg-white
  //-         span(v-if="node").text-bold.text-black.text-center {{ node.name }}
  //-   .col.bg-grey-3
  //- q-footer(reveal).row.full-width.justify-center.bg-grey-3
  //-   k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`)
  q-page-conainter.row.window-height.bg-black
    //- menu
    div(:style=`{width: menuShow ? '230px' : '0px', overflow: 'hidden'}`
      ).column.full-height.br
      div(
        :style=`{height: '60px'}`
        ).row.full-width
      .col.full-width.scroll
        .row.full-width.items-start.content-start
          div(
            v-for="(m, mi) in 20" :key="mi"
            :style=`{height: '50px'}`
            ).row.full-width.items-center
            span.text-white menuItem {{mi}}
    //- content
    div(:style=`{position: 'relative'}`).col.full-height.br
      fragment(
        v-if="content" ctx="inEditor" :index="0" :stageFirst="2" :inExplorer="true"
        :fragment="{content: content, cuts: [], name: '', thumbUrl: '', scale: content.type === 'VIDEO' ? content.duration : 100}"
        :style=`{height: '100%'}`)
      div(
        :style=`{
          position: 'absolute', zIndex: 1000, top: 0, left: 0,
          height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round flat color="white" icon="menu" @click="menuShow = !menuShow")
      div(
        :style=`{
          position: 'absolute', zIndex: 1000, top: 0, right: 0,
          height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round flat color="white" icon="menu" @click="metaShow = !metaShow")
    //- fragments/nodes from ws/kalpa
    div(
      :style=`{width: metaShow ? '500px' : '0px', overflow: 'hidden'}`
      ).column.full-height.bg-grey-10
      div(
        :style=`{height: '60px'}`
        ).row.full-width.items-center.q-px-sm
        span.text-white Search sort group
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-pa-sm
          div(
            v-for="(i, ii) in 100" :key="ii"
            :style=`{height: '60px', borderRadius: '10px'}`
            ).row.full-width.items-center.justify-center.q-pa-sm.bg-grey-7.q-mb-sm
            span.text-white item {{ ii }}
    //- node
    div(
      v-if="false"
      :style=`{width: '500px'}`
      ).column.full-height.bg-grey-10
      div(:style=`{height: '60px'}`).row.full-width.justify-center.items-center
        span.text-white Essence
      //- .col.full-width.q-pa-sm
      .row.full-width.q-pa-sm
        div(
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.bg-black
          fragment(
            v-if="content" ctx="inEditor" :index="0" :stageFirst="2" :inExplorer="true"
            :fragment="{content: content, cuts: [], name: '', thumbUrl: '', scale: content.type === 'VIDEO' ? content.duration : 100}"
            :style=`{height: '100%'}`)
      div(:style=`{height: '60px'}`).row.full-width.justify-center.items-center
        span.text-white Essence
      //- .col.full-width.q-pa-sm
      .row.full-width.q-pa-sm
        div(
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.bg-black
          fragment(
            v-if="content" ctx="inEditor" :index="0" :stageFirst="2" :inExplorer="true"
            :fragment="{content: content, cuts: [], name: '', thumbUrl: '', scale: content.type === 'VIDEO' ? content.duration : 100}"
            :style=`{height: '100%'}`)
      div(:style=`{height: '60px'}`).row.full-width.justify-center.items-center
        span.text-white Essence
    //- div(
    //-   v-if="false"
    //-   :style=`{marginBottom: '1000px'}`).row.full-width.items-start.content-start.justify-center
    //-   div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pa-sm
    //-     //- content nodes header
    //-     div(:style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
    //-       ).row.full-width.items-center.justify-center.bg-white.q-mt-xl.q-mb-sm
    //-       span.text-center {{ $t('Similar nodes') }}
    //-     //- similar nodes list
    //-     node-loader(ref="nodeLoader" :variables="variables" type="sphereNodes")
    //-       template(v-slot:default=`{nodes}`)
    //-         node-list(:nodes="nodes" :nodesBan="[]" @nodeClick="nodeClick")
</template>

<script>
import fragment from 'components/node/fragment'

export default {
  name: 'contentExplorer',
  components: {fragment},
  props: [],
  data () {
    return {
      width: 0,
      content: null,
      showNameSticky: false,
      previewHeight: 0,
      menuShow: true,
      metaShow: true
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
          this.content = null
          await this.$wait(300)
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
      let content = await this.$store.dispatch('objects/get', { oid, priority: 0 })
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
