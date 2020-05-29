<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).column.fit
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-start.content-start.b-50.q-pb-sm.q-px-sm
    slot(name="header")
    //- navigation
    div(v-if="$slot ? !$slot.header : true").row.full-width.items-center.content-center.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Chains
    //- search
    div(v-if="true").row.full-width
      q-input(
        v-model="searchString"
        filled dense dark color="white"
        label="Search..."
        ).full-width
  //- body
  .col.full-width.scroll
  //- footer
  div.row.full-width
</template>

<script>
export default {
  name: 'wsChainList',
  data () {
    return {
      searchString: ''
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
