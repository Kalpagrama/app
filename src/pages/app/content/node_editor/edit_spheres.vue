<template lang="pug">
.row.full-width.items-start.content-start
  div(ref="scrolledArea" :style=`{backgroundColor: backgroundColor, minHeight: '40px'}`).scroll.row.full-width.items-center.content-center.br-10.q-pa-xs
    q-btn(
      v-for="(s,si) in sphereOwner.spheres" :key="si"
      flat no-caps dense color="white"
      :style=`{
        whiteSpace: 'nowrap',
      }`
      @click="sphereDelete(s)"
    ).q-px-xs.ellipsis
      span(:style=`{maxWidth: $q.screen.width > $store.state.ui.pageMinWidthDesktop ? '500px' : '300px'}`).ellipsis.text-caption {{ '✦'+s.name }}
    q-input( v-if="sphereOwner.spheres.length !== maxSphereCnt"
      v-model="sphere"
       dark dense borderless
       maxlength="108"
       color="green"
      :placeholder="sphereOwner.spheres.length < 1 ? placeholder : sphereOwner.spheres.length === maxSphereCnt ? '' : 'Можно добавить ещё ' + (maxSphereCnt - sphereOwner.spheres.length)"
      :input-style=`{
      textAlign: 'left',
      // paddingLeft: '16px',
    }`
      :style=`{
        minWidth: '260px',
        borderRadius: '5px',
        // border: '1px solid grey'
      }`
      @blur=""
      @keydown.enter="sphereAdd(sphere)"
      @keydown.backspace="onBackspacePressed()"
    ).row.q-pl-sm.full-width
  .row.full-width
      slot(name="left")
  .row.full-width.justify-end
      slot(name="right")
</template>

<script>
import { scroll } from 'quasar'
const { getScrollTarget, setHorizontalScrollPosition, getScrollWidth } = scroll

export default {
  name: 'editSpheres',
  emits: ['toolTipFilter'],
  props: {
    sphereOwner: {type: Object, required: true},
    maxSphereCnt: {type: Number, default: 5},
    placeholderText: {type: String},
    backgroundColor: {type: String, default: 'rgba(30,30,30,0.9)'},
  },
  data () {
    return {
      sphere: ''
    }
  },
  watch: {
    sphere(to) {
      this.$emit('toolTipFilter', to)
    },
  },
  computed: {
    placeholder() {
      return this.placeholderText || this.$t('Добавьте дополнительные смыслы')
    }
  },
  methods: {
    sphereAdd (sphere) {
      if (!sphere) return
      this.$log('sphereAdd')
      // checks
      if (sphere.length === 0) return
      if (this.sphereOwner.name === sphere) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('major essence is equal minor')})
        if (this.sphere === sphere) this.sphere = ''
        return
      }
      if (this.sphereOwner.spheres.find(s => s.name === sphere)) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Already added!')})
        if (this.sphere === sphere) this.sphere = ''
        return
      }
      if (this.sphereOwner.spheres.length >= this.maxSphereCnt) {
        this.$q.notify({type: 'negative', position: 'top', message: this.$t('Maximum ' + this.maxSphereCnt + ' spheres!')})
        return
      }
      // do stuff
      this.sphereOwner.spheres.push({name: sphere})
      this.sphere = ''
      let scrollTarget = getScrollTarget(this.$refs.scrolledArea)
      setHorizontalScrollPosition(scrollTarget, getScrollWidth(scrollTarget), 1000)
    },
    sphereDelete (s) {
      this.$log('sphereDelete', s)
      this.sphereOwner.spheres = this.sphereOwner.spheres.filter(i => i.name !== s.name)
    },
    onBackspacePressed () {
      this.$log('sphereDelete')
      if (!this.sphere && this.sphereOwner.spheres.length) {
        let deletedSphere = this.sphereOwner.spheres.pop()
        this.sphere = deletedSphere.name
      }
    },
  }
}
</script>
