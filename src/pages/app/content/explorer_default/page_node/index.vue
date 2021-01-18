<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  .row.full-width.q-pa-sm
    node-feed(
      v-if="node.items.length === 1"
      :node="node"
      :isActive="true"
      :isVisible="true")
      template(v-slot:items)
        .row.full-width
    //- node-feed(
      v-if="node.items.length === 2"
      :node="nodeLocal"
      :isActive="true"
      :isVisible="true")
    //- div(
      v-for="n in 100" :key="n"
      :style=`{
        height: '50px',
      }`
      ).row.full-width.q-mb-sm.br
  //- footer sticky
  div(
    :style=`{
      position: 'fixed', zIndex: 1000, left: '0px',
      bottom: '0px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        height: '70px',
        borderRadius: '10px 10px 0 0',
      }`).row.full-width.items-center.content-center.b-40.q-px-sm
      q-btn(
        @click="$emit('nodeCancel')"
        flat color="grey-7" icon="west" no-caps
        :style=`{maxWidth: '60px'}`)
        .row.full-width.justify-center
          small Назад
</template>

<script>
export default {
  name: 'pageNode',
  props: ['contentKalpa', 'player', 'node'],
  computed: {
    nodeLocal () {
      if (this.node.items.length === 1) {
        return this.node
      }
      else {
        let node = JSON.parse(JSON.stringify(this.node))
        // return item
        // node.items = node.items.filter(i => {
        //   return !(i.items && i.items[0].layers[0].contentOid === this.contentKalpa.oid)
        // })
        return node
      }
    }
  }
}
</script>
