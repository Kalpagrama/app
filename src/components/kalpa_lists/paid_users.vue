<template lang="pug">
div(:style=`{ maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.b-40
  .column.full-width
    .row.full-width.justify-end.relative-position
      q-resize-observer(@resize="scrollHeight = $q.screen.height - $event.height")
      q-btn(flat round icon="close" color="white" size="md" @click="$emit('close')")
      span.absolute-center.text-white {{$t('Список оплативших')}}
    .col.row.full-width
      q-virtual-scroll(ref="vs" :items="content.payInfo.paidUsers" :virtual-scroll-item-size="40" :style=`{maxHeight: scrollHeight+'px'}` separator).full-width
        template(v-slot="{item, index}")
          div(
            :style=`{height: '40px', border: '1px solid ' +  $getPaletteColor('green-8')}`
            @click="$emit('close')").cursor-pointer.row.full-width.items-center.q-mb-sm.q-px-xs.b-35.br-10
            span(:style=`{textAlign: 'center'}`).text-grey-5.col {{item.name}}

  slot(name="buttons")
</template>

<script>
export default {
  name: 'paidUsers',
  props: ['content'],
  data () {
    return {
      scrollHeight: 100,
    }
  }
}
</script>
