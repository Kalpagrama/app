<template lang="pug">
.column.fit
  //- q-layout(view="hHh lpR fFf" container :style=`{height: height ? height+'px' : $q.screen.height+'px'}`)
  //- q-header(reveal)
  div(:style=`{height: '60px'}`).row.full-width.justify-center
    div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.fit.items-center.content-center
        //- div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
        //-   q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('cancel')"
        //-     :style=`{background: 'rgba(0,0,0,0.5)'}`)
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            span.text-white.text-bold {{ name || 'Давай найдем что-нибудь'}}
        //- div(:style=`{width: '60px', height: '60px'}`).row.items-center.content-center.justify-center
  //- q-page-container
  //-   q-page
  .col.full-width.scroll
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
          ws-items(
            ctx="finder"
            :pages="pages" :page="page" @page="pageClick"
            @item="itemClick")
</template>

<script>
// TODO search for all the contents and its layers, or composition + name...
// or create a composition
export default {
  name: 'compositionFinder',
  props: ['name', 'height'],
  components: {},
  data () {
    return {
      oid: undefined,
      node: null,
      dialogOpened: false,
      page: 'content',
      pages: [
        {id: 'contentNotes', name: 'Contents'},
        {id: 'node', name: 'Nodes'}
      ]
    }
  },
  methods: {
    itemClick ({type, item}) {
      this.$log('itemClick', type, item)
      if (type === 'content') {
        let content = item.items[0].layers[0].content
        this.$log('content', content)
        let composition = {
          operation: { type: 'CONCAT', items: [], operations: null },
          layers: [{ content: content, figuresAbsolute: [], figuresRelative: [], spheres: [] }]
        }
        this.$log('composition', composition)
        this.$emit('composition', composition)
      }
      else if (type === 'composition') {
        // TODO
      }
    },
    pageClick (p) {
      this.$log('pageClick', p)
      this.page = p
    },
    layerExport (l) {
      this.$log('layerExport')
      this.$emit('layer', l)
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
