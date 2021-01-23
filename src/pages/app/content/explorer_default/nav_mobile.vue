<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      height: '70px',
      maxWidth: $store.state.ui.pageWidth+'px',
      borderRadius: '10px 10px 0 0',
    }`
    ).row.full-width.items-center.content-center.justify-between.b-40.q-px-sm
    q-btn(
      @click="$routerKalpa.back()"
      flat color="grey-7" icon="west" no-caps
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Назад
    q-btn(
      @click="$emit('pageId', 'nodes')"
      flat icon="adjust" no-caps
      :color="pageId === 'nodes' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small(:style=`{whiteSpace: 'nowrap'}`) Ядра
    //- q-btn(
      @click="$emit('pageId', 'creator')"
      flat icon="add_circle_outline" no-caps
      :color="'green'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small(:style=`{whiteSpace: 'nowrap'}`) Создать
    q-btn(
      @click="$emit('pageId', 'drafts')"
      flat icon="filter_tilt_shift" no-caps
      :color="pageId === 'drafts' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Заметки
    q-btn(
      @click="$emit('pageId', 'details')"
      flat no-caps
      :color="pageId === 'details' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      q-icon(name="fas fa-info" size="19px").q-mb-xs
      .row.full-width.justify-center
        small Инфо
    kalpa-menu-popup-global
</template>

<script>
export default {
  name: 'navMobile',
  props: ['pageId', 'contentKalpa'],
  data () {
    return {
    }
  }
}
</script>
