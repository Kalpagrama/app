<template lang="pug">
div(:style=`{height: height || '120px'}`
  ).row.full-width.items-start.content-start.justify-start
  router-link(
    v-for="(s,si) in spheres" :key="s.oid" :to="'/sphere/'+s.oid"
    :style=`{borderRadius: '10px'}`
    ).text-white.q-pa-sm.q-mr-sm.q-mb-sm.bg-grey-8 {{ '#'+s.name }}
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
