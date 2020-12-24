<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).column.full-width.items-start.content-start.b-30
    .row.full-width.items-center.content-center.q-px-xs
      .col
        .row.full-width.q-px-sm
          span.text-white Похожее
      //- q-btn(
        round flat color="white" icon="tune")
      q-btn(
        @click="$emit('close')"
        round flat color="white" icon="clear")
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-px-sm
        div(
          v-for="n in 100" :key="n"
          :style=`{
            height: '100px',
            background: 'rgb(35,35,35)',
            borderRadius: '10px',
          }`
          ).row.full-width.q-pa-sm.q-mb-sm
          small.text-white Content - {{ n }}
</template>

<script>
export default {
  name: 'pageContents',
  data () {
    return {
    }
  }
}
</script>
