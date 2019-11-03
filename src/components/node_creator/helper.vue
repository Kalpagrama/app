<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '60px'}`).row.full-width
    //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
    .col.full-height
      .row.fit.items-center.justify-start.q-px-md
        span.text-bold Че за ядрогенератор?
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" @click="$emit('hide')")
  .col.scroll
    .row.full-width.items-start.content-start.q-px-sm
      .row.full-width
        h6 1. Добавь фрагменты
      .row.full-width
        h6 2. Напиши суть
      .row.full-width
        h6 3. Опубликуй ядро
</template>

<script>
export default {
  name: 'nodeCreator__helper',
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
