<style lang="stylus">
</style>
<template lang="pug">
.column.fit.bg-grey-3
  div(:style=`{height: '60px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.q-px-md
        span.text-bold {{ $t('Spheres') }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" color="grey" @click="$emit('close')")
  .col.full-width.scroll.kscroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(s, skey, si) in spheres" :key="skey" @click="sphereClick(s)"
        :style=`{height: '40px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.q-mr-sm.q-mb-sm.bg-grey-4.cursor-pointer
        //- div(:style=`{height: '40px', width: '40px', borderRadius: '10px', overflow: 'hidden', background: $randomColor(skey)}`).row
        .col.full-height
          .row.fit.items-center.q-px-sm
            span.text-black {{ s.name }}
</template>

<script>
export default {
  name: 'wsSpheres',
  data () {
    return {
    }
  },
  computed: {
    spheres () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        val.spheres.map(s => {
          if (!acc[s.name]) acc[s.name] = s
        })
        return acc
      }, {})
    }
  },
  methods: {
    sphereClick (s) {
      this.$log('sphereClick', s)
      // TODO: go to wsItems with this sphere? or spheres: []
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
