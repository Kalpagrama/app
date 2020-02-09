<template lang="pug">
.row.fit
  div(:style=`{position: 'relative'}`).column.fit
    //- actions
    q-btn(
      round push size="lg" color="green" icon="add" @click="noteAdd()"
      :style=`{position: 'absolute', right: '16px', bottom: '16px'}`)
    //- header: filters
    div(:style=`{height: '60px'}`).row.full-width
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        div(
          v-for="(n, ni) in notes" :key="ni"
          :style=`{height: '40px'}`
        ).row.full-width.items-center.content-center.bg-grey-8
        //- span {{ noteName(n.name) }}
        span.text-white {{ n }}
</template>

<script>
export default {
  name: 'wsNotes',
  data () {
    return {
      notes: []
    }
  },
  methods: {
    async notesLoad () {
      this.$log('notesLoad start')
      let {items} = await this.$store.dispatch('lists/wsItems', {wsItemsType: 'NOTES'})
      this.$log('notesLoad done', items)
      return items.map(i => i.object)
    },
    noteName (name) {
      return this.name.split('-')[1]
    },
    noteAdd () {
      this.$log('noteAdd')
    },
    noteDelete () {
      this.$log('noteDelete')
    }
  },
  async mounted () {
    this.$log('mounted')
    this.notes = await this.notesLoad()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
