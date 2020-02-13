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
    //- div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
    //-   q-btn(round flat color="green" icon="refresh" :loading="contentsLoading" @click="contentsReload()")
  .col.full-width.scroll
    .row.full-with.items-start.content-start.q-px-sm
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
      contentsLoading: false,
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
    contentClick (c, ci) {
      this.$log('contentClick', c, ci)
      this.$emit('item', c)
    },
    async contentLoad (oid) {
      this.$log('contentLoad start', oid)
      let content = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      this.$log('contentLoad done', content)
      return content
    },
    async contentsFindStart () {
      this.$log('contentsFindStart')
    },
    async contentsLoad () {
      this.$log('contentsLoad start')
      this.contentsLoading = true
      // await this.$wait(1000)
      let res = await this.$store.dispatch('lists/wsItems', {wsItemsType: 'CONTENTS'})
      this.$log('contentsLoad done', res)
      this.contentsLoading = false
      // return
      this.res = res
    },
    async contentsReload () {
      this.$log('contentsReload')
      this.contents = await this.contentsLoad()
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      // try to find item in ws by name CONTENT- + content.oid
      let item = await this.$store.dispatch('workspace/get', {name: 'CONTENT-' + content.oid})
      this.$log('nodeFind', item)
      // if no item create node content container
      if (!item) {
        // create node
        this.$log('CREATE WS NODE')
        let node = {
          name: 'CONTENT-' + content.oid,
          layout: 'PIP',
          category: 'FUN',
          spheres: [],
          compositions: [
            {
              operation: { type: 'CONCAT', items: [], operations: null },
              layers: [{ content: content, figuresAbsolute: [] }]
            }
          ]
        }
        let res = await this.$store.dispatch('workspace/wsNodeSave', node)
        this.$log('res', res)
        this.$emit('item', JSON.parse(JSON.stringify(res)))
        // await this.$wait(300)
        // this.contentsReload()
      } else {
        this.$log('USE WS NODE')
        // using node...
      }
    }
  },
  async mounted () {
    // this.$log('mounted')
    // await this.contentsLoad()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
