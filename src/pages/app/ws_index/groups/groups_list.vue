<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: '700px'}`).row.full-width
    div(
      :style=`{
        //- position: 'sticky', top: '76px', left: 0,
        //- height: $q.screen.height-120+'px',
        //- width: '200px',
        borderRadius: '10px',
        //- background: 'rgb(35,35,35)',
      }`).row.full-width.items-start.content-start
      .row.full-width
        q-btn(round flat dense color="grey-7" icon="search")
        .col
        q-btn(round flat dense color="green" icon="add" @click="$emit('create')")
      .row.full-width.items-start.content-start
        q-btn(
          v-for="n in nodes" :key="n.id"
          @click="$emit('node', n)"
          flat no-caps dense align="left"
          :color="node && node.id === n.id ? 'green' : 'grey-7'"
          :style=`{
            background: 'rgb(35,35,35)',
          }`
          ).row.full-width.q-px-xs.q-mb-xs
          span {{ n.name }}
</template>

<script>
export default {
  name: 'groupsList',
  props: ['nodes'],
}
</script>
