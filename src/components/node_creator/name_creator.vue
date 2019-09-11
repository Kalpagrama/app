<template lang="pug">
div(:style=`{position: 'relative', maxWidth: '100%'}`).row.full-width
  div(:style=`{height: '50px'}`).row.full-width.items-center.q-px-md
    span В чем суть? что объединяет эти вещи?
  div(:style=`{position: 'relative', width: '300px'}`).full-width
    div(
      :style=`{position: 'absolute', zIndex: 1000, top: -spheresHeight+'px', height: spheresHeight+'px', maxHeight: '400px', overflow: 'hidden'}`).row.full-width
      div(:style=`{borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).column.fit.bg-white
        .col.scroll
          div(v-for="(s, si) in 100" :key="si" @click="sphereClick(s, si)"
            :style=`{height: '40px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.q-px-sm.cursor-pointer
            span sphere {{ si }}
    .row.full-width.q-px-sm
      div(:style=`{borderRadius: '10px', overflow: 'hidden !important', zIndex: 900}`).row.full-width
        q-input(ref="kinput" v-model="nameRaw" filled type="textarea" autogrow :maxlength="130" @input="handleInput").full-width
  .row.full-width.q-px-md
    small.text-grey-7 type # to add spheres or @ to mention friends
</template>

<script>
export default {
  name: 'nameCreator',
  data () {
    return {
      nameRaw: '',
      spheresHeight: 0
    }
  },
  methods: {
    handleInput (e) {
      this.$log('handleInput', e)
      let h = e.length * 10
      if (h <= 400) this.$tween.to(this, 0.5, {spheresHeight: e.length * 10})
      this.$emit('name', e)
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      document.activeElement.blur()
    },
    swipeDown () {
      this.$log('swipeDown')
      this.$q.notify('swipe down!')
      document.activeElement.blur()
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

<style lang="stylus">
.q-menu
  border-radus: 10px
  overflow: hidden
</style>
