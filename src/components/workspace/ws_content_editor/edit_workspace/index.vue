<template lang="pug">
.column.fit
  //- header: bar
  .row.full-width.q-px-sm.q-pt-sm
    div(
      :style=`{
        height: '40px',
        borderRadius: '10px',
        overflow: 'hidden',
      }`).row.full-width.b-70
  //- header: search
  .row.full-width.q-pa-sm
    q-input(
      v-model="searchString"
      label="Find layer in your workspace"
      filled dark dense color="white"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md.q-px-sm
      div(
        v-for="(l,li) in layers" :key="l.id"
        :style=`{borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.q-px-md.q-mb-xs.b-70
  div().row.full-width.q-pa-sm
    kalpa-buttons(
        :value="pages" :id="pageId" idKey="id"
        screenSet="gt.xs"
        @id="$emit('pageId', $event)").full-width.justify-center
</template>

<script>
export default {
  name: 'editWorkspace',
  props: ['pages', 'pageId'],
  data () {
    return {
      searchString: '',
      layersSelected: []
    }
  },
  computed: {
    layers () {
      return []
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
