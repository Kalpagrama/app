<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- main
  div(:style=`{position: 'relative'}`).col.full-height
    //- content.name
    div(
      v-if="content"
      :style=`{
        position: 'absolute', top: 0, left: '16px', zIndex: 1000,
        height: '72px'}`
      ).row.items-center.content-center.justify-start
      div(
        :style=`{height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.3)'}`
        ).row.items-center.content-center.q-px-sm
        span(:style=`{whiteSpace: 'nowrap'}`).text-white.cursor-pointer {{ content.name }}
    .column.fit
      .col.full-width.full-height
        //- span.text-white node: {{wsNode}}
        //- content
        content-video(v-if="content && content.type === 'VIDEO'" :node="wsNode.object" :content="content")
        //- content-image(v-if="content.type === 'IMAGE'" :content="content")
</template>

<script>
import contentImage from './content_image'
import contentVideo from './content_video'
import contentRelations from './relations'

export default {
  name: 'contentExplorer',
  components: {contentImage, contentVideo, contentRelations},
  props: ['wsNode', 'value'],
  data () {
    return {
      content: null,
      menuDesktopShow: false,
      menuDesktopMaxWidth: 0,
      nodesShow: false,
      nodesMaxWidth: 0
    }
  },
  watch: {
    wsNode: {
      immediate: true,
      handler (to, from) {
        this.$log('wsNode CHANGED', to)
        if (to) {
          this.content = to.object.compositions[0].layers[0].content
        }
      }
    },
    nodesShow: {
      immediate: true,
      handler (to, from) {
        this.$log('nodesShow CHANGED', to)
        this.$tween.to(this, 0.5, {nodesMaxWidth: to ? 500 : 0})
      }
    },
    menuDesktopShow: {
      immediate: true,
      handler (to, from) {
        this.$log('menuDesktopShow CHANGED', to)
        this.$tween.to(this, 0.5, {menuDesktopMaxWidth: to ? 290 : 0})
      }
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
