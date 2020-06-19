<style lang="sass" scoped>
.composition
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  :class=`{
    'col-xs-12': view === 'maxi',
    'col-sm-6': view === 'maxi',
    'q-pa-sm': view === 'maxi',
    'row': view !== 'maxi',
    'full-width': view !== 'maxi'
  }`
  )
  //- maxi
  div(
    v-if="view === 'maxi'"
    :style=`{
      position: 'relative',
      borderRadius: $store.state.ui.borderRadius+'px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-start.content-start.cursor-pointer.b-70.composition
    //- actions
    q-btn(
      round flat dense color="white" icon="more_vert"
      :style=`{
        position: 'absolute', zIndex: 1000, top: 0, right: 0,
        background: 'rgba(0,0,0,0.5)',
      }`).bg
      kalpa-menu-popup(:actions="actions")
    //- preview
    img(
      @click="$emit('pick')"
      :src="composition.thumbOid"
      draggable="false"
      ).full-width
    //- name
    span(
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '0px', left: '0px',
        borderRadius: $store.state.ui.borderRadius+'px',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.4)',
        pointerEvents: 'none',
      }`
      ).text-white.text-bold.q-pa-sm {{ compositionName }}
  //- semi
  div(
    v-if="view === 'semi'"
    @click="$emit('pick')"
    :style=`{
      borderRadius: $store.state.ui.borderRadius+'px',
      overflow: 'hidden',
    }`
    ).row.full-width.cursor-pointer.b-70.q-mb-sm.composition
    img(
      :src="composition.thumbOid"
      draggable="false"
      :style=`{
        height: '100px',
        borderRadius: $store.state.ui.borderRadius+'px',
        overflow: 'hidden',
      }`)
    .col.full-height
      .row.fit.items-center.content-between.q-py-sm.q-px-md
        span.text-white.text-bold {{ compositionName }}
        div(
          v-if="contentKalpa"
          ).row.full-width
          small.text-grey-5 {{ contentKalpa.name.slice(0, 100) }}
  //- mini
  div(
    v-if="view === 'mini'"
    @click="$emit('pick')"
    :style=`{
      height: '50px',
      borderRadius: $store.state.ui.borderRadius+'px',
      overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.cursor-pointer.q-px-md.q-py-sm.q-mb-xs.b-70.composition
    span.text-white.text-bold {{ compositionName }}
    div(
      v-if="contentKalpa"
      ).row.full-width
      small.text-grey-5 {{ contentKalpa.name.slice(0, 100) }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'compositionItem',
  props: ['composition', 'ctx', 'view'],
  data () {
    return {
      contentKalpa: null
    }
  },
  computed: {
    compositionName () {
      let name = this.composition.name
      if (name.length > 0) return name.slice(0, 40)
      else return `${this.$time(this.composition.layers[0].figuresAbsolute[0].t)} - ${this.$time(this.composition.layers[0].figuresAbsolute[1].t)}`
    },
    compositionDuration () {
      return this.composition.layers.reduce((acc, layer) => {
        acc += (layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t)
        return acc
      }, 0)
    },
    actions () {
      return {
        edit: {
          name: 'Edit',
          fn: () => this.$emit('pick')
        },
        delete: {
          name: 'Delete',
          fn: () => this.$emit('delete')
        }
      }
    }
  },
  async mounted () {
    // this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.composition.contentOid)
  }
}
</script>
