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
      flat icon="panorama_fish_eye" no-caps
      :color="pageId === 'nodes' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small(:style=`{whiteSpace: 'nowrap'}`) Ядра
    q-btn(
      @click="$emit('create-start')"
      round flat color="green"
      :style=`{
        width: '50px', height: '50px',
        borderRadius: '50%',
      }`
      ).q-mb-md
      q-icon(name="add_circle_outline" size="40px")
    q-btn(
      @click="$emit('pageId', 'drafts')"
      flat icon="filter_tilt_shift" no-caps
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
    //- q-btn(
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
