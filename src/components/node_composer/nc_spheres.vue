<template lang="pug">
div(
  :style=`{borderRadius: '10px', oveflow: 'hidden'}`).row.full-width.bg-white
  //- spheres
  div(:style=`{minHeight: '60px', padding: '10px'}`).row.full-width
    div(:style=`{height: '60px'}`).row.full-width.items-center
      span.text-bold {{ $t('Spheres') }}
      .col
      q-btn(round flat icon="add" color="green")
    .row.full-width.items-start.content-start
      div(
        v-for="(s,si) in node.spheres" :key="si"
        :style=`{borderRadius: '4px'}`).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm
        small {{ s }}
  //- categories
  div(:style=`{minHeight: '60px', padding: '10px'}`).row.full-width
    div(:style=`{height: '60px'}`).row.full-width.items-center
      span.text-bold {{ $t('Categories') }}
      .col
      q-btn(round flat icon="add" color="green")
    .row.full-width.items-start.content-start
      div(
        v-for="(c, ci) in node.categories" :key="si"
        :style=`{borderRadius: '4px'}`).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm
        small {{ c }}
</template>

<script>
export default {
  name: 'ncSpheres',
  props: ['node'],
  data () {
    return {
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
