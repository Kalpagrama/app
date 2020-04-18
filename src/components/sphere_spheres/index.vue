<style lang="sass">
.sphere-item
  &:hover
    background: #777 !important
</style>
<template lang="pug">
div(:style=`{height: height || '120px'}`
  ).row.full-width.items-start.content-start.justify-start
  router-link(
    v-for="(s,si) in spheres" :key="s.oid"
    :to="'/sphere/'+s.oid"
    v-if="s.name !== '*unnamed*'"
    :style=`{borderRadius: '10px'}`
    ).text-white.q-px-sm.q-py-xs.q-mr-xs.q-mb-xs.bg-grey-8.sphere-item
    small(:style=`{userSelect: 'none'}`) {{ '#'+s.name }}
</template>

<script>
export default {
  name: 'sphereSpheres',
  props: ['oid', 'height'],
  data () {
    return {
      spheres: []
    }
  },
  async mounted () {
    this.$log('mounted')
    let res = await this.$store.dispatch('lists/sphereSpheres', {
      oid: this.oid,
      pagination: {pageSize: 30, pageToken: null},
      filter: null,
      sortStrategy: 'HOT'
    })
    this.$log('res', res)
    this.spheres = res.items
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
