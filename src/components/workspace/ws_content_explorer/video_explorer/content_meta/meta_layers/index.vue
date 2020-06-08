<template lang="pug">
.column.fit
  //- header
  .row.full-width.items-center.content-center.q-px-sm
    .row.full-width.q-py-md
      span.text-white.text-bold Layers
    .row.full-width
      q-input(
        v-model="searchString"
        label="Find layer"
        filled dark dense color="grey-5").full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            @click="searchString = ''"
            round flat dense icon="clear" color="grey-5")
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      div(
        v-for="(l,li) in layers" :key="l.id"
        :style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-px-md.b-60.q-mb-xs
        .col
        small.text-white {{ $time(l.figuresAbsolute[0].t) }}
      //- add layer
      div(
        :style={
          height: '50px',
          borderRadius: '10px',
          overflow: 'hidden',
        }
        ).row.full-width.b-60
        q-btn(flat color="green" icon="add").fit
</template>

<script>
export default {
  name: 'metaLayers',
  props: ['stateExplorer'],
  data () {
    return {
      searchString: '',
    }
  },
  computed: {
    layers () {
      return this.stateExplorer.contentWs?.layers
    }
  }
}
</script>
