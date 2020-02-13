<template lang="pug">
.row.fit
  div(:style=`{position: 'relative'}`).column.fit
    //- actions
    q-btn(
      round push size="lg" color="green" icon="add" @click="$emit('add')"
      :style=`{position: 'absolute', zIndex: 2000, right: '16px', bottom: '16px'}`)
    //- header
    div(
      :style=`{height: '60px'}`
      ).row.full-width.items-center
      .col.full-height
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        //- div(
        //-   v-for="(c,ci) in compositions" :key="ci"
        //-   :class=`{
        //-     'bg-grey-9': true
        //-   }`
        //-   :style=`{height: '60px'}`
        //-   ).row.full-width.items-center.q-px-md
        //-   span {{ c.name }}
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
      let {items} = await this.$store.dispatch('lists/wsItems', {wsItemsType: 'COMPOSITIONS'})
      this.$log('items', items)
      return items
    }
  },
  async mounted () {
    this.$log('mounted')
    // this.compositions = await this.compositionsLoad()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
