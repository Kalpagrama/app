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
    ).row.full-width.q-pa-md
    content-finder(
      :sources="['url', 'device']"
      @content="contentFound")
  //- actions, list, gallery, feed, list-expanded
  div(:style=`{height: '60px'}`).row.full-width
    .col.full-height
    div(:style=`{width: '60px', height: '60px'}`).row.items-center.justify-center
      q-btn(round flat color="green" icon="refresh" @click="contentsReload()")
  .col.full-width.scroll
    .row.full-with.items-start.content-start.q-px-md
      div(
        v-for="(c,ci) in contents" :key="ci" @click="contentClick(c,ci)"
        :class=`{'bg-grey-10': c.oid !== oid, 'bg-white': c.oid === oid}`
        :style=`{minHeight: '50px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.cursor-pointer.q-mb-sm
        span(
          :class=`{
            'text-white': c.oid !== oid,
            'text-green': c.oid === oid,
            'text-bold': c.oid === oid}`
        ).q-ma-sm.cursor-pointer {{ c.compositions[0].layers[0].content.name }}
</template>

<script>
import contentFinder from 'components/content/finder'

export default {
  name: 'wsContents',
  components: {contentFinder},
  props: ['oid'],
  data () {
    return {
      content: null,
      contents: []
    }
  },
  watch: {
  },
  methods: {
    contentClick (c, ci) {
      this.$log('contentClick', c, ci)
      this.content = c
      this.$emit('item', c)
    },
    async contentLoad (oid) {
      this.$log('contentLoad start', oid)
      let content = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      this.$log('contentLoad done', content)
      return content
    },
    async contentsLoad () {
      this.$log('contentsLoad start')
      let {items} = await this.$store.dispatch('lists/wsItems', {pagination: {pageSize: 30, pageToken: null}, sortStrategy: 'HOT', filter: {nameRegExp: '^CONTENT-.{11}=$', types: ['NODE']}})
      this.$log('contentsLoad done', items)
      // return items.map(i => i.object)
      return items
    },
    async contentsReload () {
      this.$log('contentsReload')
      this.contents = await this.contentsLoad()
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      // try to find item in ws by name CONTENT- + content.oid
      let {items} = await this.$store.dispatch('lists/wsItems', {
        pagination: {pageSize: 30, pageToken: null},
        sortStrategy: 'HOT',
        filter: {types: ['NODE'], name: 'CONTENT-' + content.oid}
      })
      this.$log('nodeFind', items)
      // if no item create node content container
      if (items.length === 0) {
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
        await this.$wait(300)
        this.contentsReload()
      } else {
        this.$log('USE WS NODE')
        // using node...
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.contents = await this.contentsLoad()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
