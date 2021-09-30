<template lang="pug">
.row.full-width.items-start.content-start
  div(ref="scrolledArea").scroll.row.full-width.items-center.content-center.no-wrap
    q-btn(
      v-for="(s,si) in node.spheres" :key="si"
      flat no-caps dense color="white"
      :style=`{
        whiteSpace: 'nowrap',
      }`
      @click="sphereDelete(s)"
    ).q-px-xs {{ '✦'+s.name }}
    q-input(
      v-model="sphere"
       dark dense
       color="green"
      :placeholder="$t('add minor essences')"
      :input-style=`{
      textAlign: 'center',
      // paddingLeft: '16px',
    }`
      :style=`{
        minWidth: '100px',
        borderRadius: '5px',
        // border: '1px solid grey'
      }`
      @blur="sphereAdd()"
      @keydown.enter="sphereAdd()"
    ).col
  .row.full-width
      slot(name="left")
  .row.full-width.justify-end
      slot(name="right")
</template>

<script>
import { scroll } from 'quasar'
const { getScrollTarget, setHorizontalScrollPosition, getScrollWidth } = scroll

export default {
  name: 'nodeEditor__editSpheres',
  props: ['node'],
  data () {
    return {
      sphere: ''
    }
  },
  methods: {
    sphereAdd () {
      this.$log('sphereAdd')
      // checks
      if (this.sphere.length === 0) return
      if (this.node.name === this.sphere) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('major essence is equal minor')})
        this.sphere = ''
        return
      }
      if (this.node.spheres.find(s => s.name === this.sphere)) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Already added!')})
        this.sphere = ''
        return
      }
      if (this.node.spheres.length >= 5) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Maximum 5 spheres!')})
        return
      }
      // do stuff
      this.node.spheres.push({name: this.sphere})
      this.sphere = ''
      let scrollTarget = getScrollTarget(this.$refs.scrolledArea)
      setHorizontalScrollPosition(scrollTarget, getScrollWidth(scrollTarget), 1000)
    },
    sphereDelete (s) {
      this.$log('sphereDelete', s)
      this.node.spheres = this.node.spheres.filter(i => i.name !== s.name)
    },
  }
}
</script>
