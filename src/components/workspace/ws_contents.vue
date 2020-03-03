<style lang="stylus">
.ws-content {
  color: white;
  &:hover {
    color: #4caf50 !important;
  }
}
</style>

<template lang="pug">
.column.fit
  //- add content
  div(
    :style=`{height: '90px'}`
    ).row.full-width.q-pa-sm
    content-finder(
      :sources="['url', 'device']"
      @content="contentFound")
  //- actions, list, gallery, feed, list-expanded
  div(v-if="false" :style=`{height: '60px'}`).row.full-width
    //- .col.full-height
    div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
      q-btn(round flat color="green" icon="search" @click="contentsFindStart()")
    .col.full-height
      //- TODO: reuse
      div(v-if="false").row.fit.items-center.justify-center
        q-btn(dense :flat="mode !== 'list'" color="green" no-caps @click="mode = 'list'").q-px-sm.q-mx-sm List
        q-btn(dense :flat="mode !== 'gallery'" color="green" no-caps @click="mode = 'gallery'").q-px-sm Gallery
        q-btn(dense :flat="mode !== 'feed'" color="green" no-caps @click="mode = 'feed'").q-px-sm.q-mx-sm Feed
  .col.full-width.scroll
    div(:style=`{paddingBottom: '80px'}`).row.full-with.items-start.content-start.q-px-sm
      kalpa-loader(type="wsContents" :variables=`{}`)
        template(v-slot:items=`{items}`)
          ws-content(
            v-for="(n, ni) in items" :key="n.oid" @contentClick="contentClick"
            :index="ni" :oid="oid", :node="n")
</template>

<script>
import contentFinder from 'components/content/finder'
import wsContent from './ws_content'

export default {
  name: 'wsContents',
  components: {contentFinder, wsContent},
  props: ['ctx'],
  data () {
    return {
      mode: 'list',
      modes: ['list', 'gallery', 'feed'],
      content: null,
      contents: [],
      res: null
    }
  },
  computed: {
    oid () {
      return this.$route.params.oid
    }
  },
  watch: {
  },
  methods: {
    contentClick (content) {
      this.$log('contentClick', content)
      this.$emit('item', {type: 'content', item: content})
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      // try to find item in ws by name
      let name = 'CONTENT-' + content.oid
      let item = await this.$store.dispatch('workspace/get', {name})
      this.$log('nodeFind', item)
      // if item use it, emit it
      if (item) {
        this.$log('*** USE node-content')
        this.$emit('item', JSON.parse(JSON.stringify(item)))
      }
      // if no item, create nodeContent, then click it
      else {
        this.$log('*** CREATE node-content')
        let nodeContentInput = {
          name,
          layout: 'PIP',
          category: 'FUN',
          spheres: [],
          compositions: [
            {
              operation: { type: 'CONCAT', items: [], operations: null },
              layers: [{ content: content, figuresAbsolute: [], figuresRelative: [], spheres: [] }]
            }
          ]
        }
        this.$log('nodeContentInput', nodeContentInput)
        let nodeContent = await this.$store.dispatch('workspace/wsNodeSave', nodeContentInput)
        this.$log('nodeContent', nodeContent)
        this.contentClick(nodeContent)
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
