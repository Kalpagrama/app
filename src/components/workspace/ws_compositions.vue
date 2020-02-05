<template lang="pug">
.row.fit
  .column.fit
    div(
      :style=`{height: '60px'}`
      ).row.full-width.items-center
      .col.full-height
        .row.fit.items-center.q-px-md
          span.text-bold.text-green Compositions
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round flat color="green" icon="refresh" @click="refresh()")
      div(
        :style=`{height: '60px', width: '60px'}`
        ).row.items-center.justify-center
        q-btn(round flat color="green" icon="add" @click="add()")
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        div(
          v-for="(c,ci) in compositions" :key="ci"
          :style=`{height: '60px'}`
          ).row.full-width.items-center.q-px-md
          span composition {{ ci }}
</template>

<script>
export default {
  name: 'wsCompositions',
  data () {
    return {
      compositions: []
    }
  },
  computed: {
    compositionsGrouped () {
      return this.compositions.reduce((acc, val) => {
        // get contents from compositions
        // group by content for compositions
        return acc
      }, {})
    }
  },
  methods: {
    refresh () {
      this.$log('refresh')
      this.compositions = []
      this.compositions = this.compositionsLoad()
    },
    async compositionsLoad () {
      this.$log('compositionsLoad')
      let {items} = await this.$store.dispatch('lists/wsItems', {pagination: {pageSize: 30, pageToken: null}, sortStrategy: 'HOT', filter: {types: ['COMPOSITION']}})
      this.$log('items', items)
      return items
    }
  },
  async mounted () {
    this.$log('mounted')
    this.compositions = await this.compositionsLoad()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
