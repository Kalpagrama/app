<template lang="pug">
div(
  :style=`{
  }`).column.fit
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
      overflow: 'hidden'
    }`
    ).row.full-width.items-start.content-start.b-50.q-pb-sm.q-px-sm
    //- navigation
    .row.full-width.items-center.content-center.q-py-md.b-50
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold {{$t('Notes')}}
    //- search
    .row.full-width
      q-input(
        v-model="searchString"
        filled dark dense color="white"
        label="Search..."
        ).full-width
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md.q-px-sm
      div(
        v-for="c in 3" :key="c"
        :style=`{height: '40px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
        ).row.full-width.b-50.q-mb-xs
</template>

<script>
export default {
  name: 'wsNoteList',
  props: [],
  data () {
    return {
      searchString: '',
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
