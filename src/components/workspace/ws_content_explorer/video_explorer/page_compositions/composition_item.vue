<style lang="sass">
.composition-item
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  :style=`{
    minHeight: '50px',
    borderRadius: $store.state.ui.borderRadius+'px',
  }`
  ).row.full-width.items-center.content-center.composition-item.b-70
  div(
    v-if="storeExplorer.compositionPlaying !== composition.id"
    @click="storeExplorer.compositionPlaying = composition.id"
    :style=`{position: 'relative', height: '50px'}`).row.full-width.items-center.contetn-center.q-px-md
    span.text-white.text-bold {{ compositionName }}
    .row.full-width.text-grey-5
      small {{ compositionStart }}
      small.q-mx-sm /
      small(:class=`{'text-red': compositionDuration > 60}`) {{ $time(compositionDuration) }}
    q-btn(
      round flat color="grey-6" icon="keyboard_arrow_down"
      :style=`{position: 'absolute', top: '4px', right: '4px',}`)
  ws-composition-editor(
    v-if="storeExplorer.compositionPlaying === composition.id && !storeExplorer.compositionEditing"
    :value="composition"
    :sidPlayer="sidPlayer"
    :options=`{
      mode: 'progress',
      ctx: 'explorer',
    }`
    ).b-60
    template(v-slot:progressActions)
      q-btn(round flat dense color="grey-4" @click="$emit('edit')")
        q-icon(name="edit" color="grey-4" size="18px")
      q-btn(flat dense color="grey-4" icon="keyboard_arrow_up" @click="storeExplorer.compositionPlaying = null").q-mr-xs
    template(v-slot:progressBar)
      div(
        :style=`{position: 'absolute', zIndex: 900, pointerEvents: 'none'}`
        ).row.fit.items-center.content-center.q-px-md
        span.text-bold.text-white {{ compositionName }}
</template>

<script>
export default {
  name: 'compositionItem',
  props: ['composition', 'compositionIndex'],
  inject: ['sidExplorer', 'sidPlayer'],
  data () {
    return {
    }
  },
  computed: {
    storeExplorer () {
      return window.stores[this.sidExplorer]
    },
    compositionName () {
      return this.composition.name
    },
    compositionStart () {
      if (this.composition.layers.length > 0) return this.$time(this.composition.layers[0].figuresAbsolute[0].t)
      else return '-'
    },
    compositionDuration () {
      if (this.composition.layers.length > 0) {
        let t = this.composition.layers.reduce((acc, layer) => {
          acc += (layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t)
          return acc
        }, 0)
        return t
      }
      else {
        return '-'
      }
    }
  }
}
</script>
