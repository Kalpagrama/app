<template lang="pug">
div(
  :style=`{
    width: '70px',
    background: 'rgba(30,30,30,0.5)',
    //- borderRadius: '20px 0 0 20px',
    borderRadius: '10px',
  }`
  ).row.items-start.content-start.justify-center
  slot
  q-btn(
    @click="$routerKalpa.back()"
    flat icon="west" no-caps color="grey-2"
    :style=`{minHeight: '70px',}`).full-width
    .row.full-width.justify-center
      small Назад
  q-btn(
    v-if="contentKalpa.type === 'BOOK'"
    @click="$emit('pageId', 'toc')"
    flat no-caps
    :color="pageId === 'details' ? 'green' : 'grey-2'"
    :style=`{minHeight: '70px'}`).full-width
    q-icon(name="toc" size="19px").q-mb-xs
    .row.full-width.justify-center
      small Главы
  q-btn(
    @click="$emit('pageId', 'drafts')"
    flat icon="filter_tilt_shift" no-caps
    :color="pageId === 'drafts' ? 'green' : 'grey-2'"
    :style=`{minHeight: '70px'}`).full-width
    .row.full-width.justify-center
      small Заметки
  q-btn(
    @click="$emit('pageId', 'nodes')"
    flat icon="adjust" no-caps
    :color="pageId === 'nodes' ? 'green' : 'grey-2'"
    :style=`{minHeight: '70px'}`).full-width
    .row.full-width.justify-center
      small(:style=`{whiteSpace: 'nowrap'}`) Ядра
  q-btn(
    @click="$emit('pageId', 'details')"
    flat no-caps
    :color="pageId === 'details' ? 'green' : 'grey-2'"
    :style=`{minHeight: '70px'}`).full-width
    q-icon(name="fas fa-info" size="19px").q-mb-xs
    .row.full-width.justify-center
      small Инфо
  kalpa-menu-popup-global(
    color="grey-2"
    :style=`{
      minHeight: '70px',
      minWidth: '70px',
    }`)
</template>

<script>
export default {
  name: 'navDesktop',
  props: ['pageId', 'contentKalpa'],
}
</script>
