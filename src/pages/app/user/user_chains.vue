<template lang="pug">
.row.full-width.justify-center
  div(style=`maxWidth: 800px; minHeight: 400px`).row.full-width.items-start.content-start
    div(v-if="true" style=`height: 60px`).row.full-width.items-center
      //- q-input(v-model="search" icon="search").full-width.q-px-sm
      //- span {{chains.length}}
      .col
      q-btn(round flat icon="search" color="grey-9").q-mr-xs
      q-btn(round flat icon="more_vert" color="grey-9")
    div(
      v-for="(c, ci) in chains" :key="c.oid" @click="chainClick(c, ci)"
      style=`height: 50px; borderTop: 1px solid #eee`
      ).row.full-width.items-center.justify-between.hr.cursor-pointer.q-px-md
      span {{c.name | cut(50)}}
      span {{c.nodesCount}}
</template>

<script>
// TODO: private chains?
// TODO: icons for what?
export default {
  name: 'userChains',
  data () {
    return {
      search: '',
      chains: [
        {oid: 'c1', name: 'Цепочка 1', nodesCount: 19},
        {oid: 'c2', name: 'Цепочка 2', nodesCount: 2001},
        {oid: 'c3', name: 'Цепочка 3', nodesCount: 20}
      ]
    }
  },
  methods: {
    chainClick (c, ci) {
      this.$log('chainClick', c)
      this.$router.push(`/app/chain/${c.oid}`)
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
