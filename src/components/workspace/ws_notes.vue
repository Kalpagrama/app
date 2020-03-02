<template lang="pug">
.row.fit
  div(:style=`{position: 'relative'}`).column.fit
    //- actions
    q-btn(
      round push size="lg" color="green" icon="add" @click="$emit('add')"
      :style=`{position: 'absolute', right: '16px', bottom: '16px'}`)
    //- header: filters
    div(:style=`{height: '60px'}`).row.full-width
    //- body
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        //- kalpa-loader(type="wsNotes" :variables="{}")
        //-   template(v-slot:items=`{items}`)
        //-     ws-note(
        //-       v-for="(n, ni) in items" :key="ni" @noteClick="noteClick"
        //-       :index="ni" :oid="oid" :node="n")
</template>

<script>
export default {
  name: 'wsNotes',
  props: ['oid'],
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
    noteClick (note) {
      this.$log('noteClick', note)
      this.$emit('item', note)
    },
    noteDelete () {
      this.$log('noteDelete')
    }
  },
  async mounted () {
    this.$log('mounted')
    // this.notes = await this.notesLoad()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
