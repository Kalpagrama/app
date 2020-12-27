<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      borderRadius: '10px 10px 0 0',
    }`
    ).row.full-width.justify-between.b-40.q-px-xs.q-pb-xs.q-pt-sm
    q-btn(
      @click="$router.back()"
      flat color="grey-7" icon="west" no-caps
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Назад
    q-btn(
      @click="$emit('pageId', 'nodes')"
      flat icon="panorama_fish_eye" no-caps
      :color="pageId === 'nodes' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small(:style=`{whiteSpace: 'nowrap'}`) Ядра и связи
    q-btn(
      @click="$emit('pageId', 'drafts')"
      flat icon="tonality" no-caps
      :color="pageId === 'drafts' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Заметки
    q-btn(
      @click="$emit('pageId', 'details')"
      flat icon="grain" no-caps
      :color="pageId === 'details' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Детали
    q-btn(
      @click="$emit('toggle')"
      flat icon="keyboard_arrow_down" no-caps
      :color="$store.state.ui.mobileMenuShow ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Свернуть
    //- q-btn(
      @click="$store.commit('ui/stateSet', ['mobileMenuShow', true])"
      flat icon="menu" no-caps
      :color="$store.state.ui.mobileMenuShow ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Меню
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
