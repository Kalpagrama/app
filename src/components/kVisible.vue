<template lang="pug">
.column.fit
  div(style=`height: 50px; borderRadius: 8px`).row.full-width.items-center.q-px-md.bg-white.q-mb-md
    span kVisible header
  div(ref="scroll").col.scroll
    k-dummy(v-for="(i, ii) in 100" :key="ii" :name="ii").q-mb-md
  div(style=`height: 50px; borderRadius: 8px`).row.full-width.items-center.q-px-md.bg-white.q-mt-md
    span kVisible footer
</template>

<script>
import kDummy from 'components/kDummy'
export default {
  name: 'kVisible',
  components: {kDummy},
  data () {
    return {
    }
  },
  methods: {
    visibilityChanged (isVisible, entry) {
      this.$log('visibilityChanged', isVisible)
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
