<template lang="pug">
.row.fit
  div(:style=`{position: 'relative'}`).column.fit
    div(
      :style=`{height: '60px'}`
      ).row.full-width.items-center.content-center.br
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
</template>

<script>
export default {
  name: 'wsContents',
  props: ['ctx'],
  data () {
    return {
      contents: []
    }
  },
  methods: {
    contentAdd () {
      this.$log('contentAdd')
    },
    async contentUse (i, ii) {
    },
    async contentClick (i, ii) {
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
