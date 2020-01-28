<template lang="pug">
.row.fit
  div(
    :style=`{
      position: 'relative', borderRight: '1px solid #4caf50',
      maxWidth: '500px'
    }`).column.fit.bg-black
    div(
      :style=`{height: '60px'}`
      ).row.full-width.items-center.content-center
      .col.full-height
        .row.fit.items-center.justify-start.q-px-md
          span.text-bold.text-green Contents
      div(
        :style=`{width: '60px', height: '60px'}`
        ).row.items-center.justify-center
        q-btn(round flat icon="add" color="green" @click="contentAdd")
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        div(
          v-for="(c, ci) in contents" :key="ci"
          :style=`{minHeight: '50px'}`
          ).row.full-width.items-center.q-px-sm
          span.text-white content {{ c }}
  .col.full-height
    ws-content(
      v-if="content"
      :content="content")
    content-finder(
      v-else
      :sources="['url', 'device', 'ws']"
      @content="contentFound"
      ).bg-black
</template>

<script>
import contentFinder from 'components/content/finder'
import wsContent from './ws_content'

export default {
  name: 'wsContents',
  components: {wsContent, contentFinder},
  props: ['ctx'],
  data () {
    return {
      content: null,
      contents: []
    }
  },
  methods: {
    contentAdd () {
      this.$log('contentAdd')
    },
    async contentFound (content) {
      this.$log('contentFound')
      this.content = content
      // add content to ws
      let res = await this.$store.dispatch('workspace/wsItemAdd', content.oid)
      this.$log('res', res)
      // go to content/oid
      // this.$router.push('/content/' + content.oid)
      // open for preview...
    },
    async contentClick (i, ii) {
      // open for preview...
    }
  },
  async mounted () {
    this.$log('mounted')
    let {items} = await this.$store.dispatch('lists/wsItems', {pagination: {pageSize: 30, pageToken: null}, sortStrategy: 'HOT', filter: {types: ['VIDEO', 'AUDIO', 'IMAGE']}})
    this.$log('items', items)
    this.contents = items
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
