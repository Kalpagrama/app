<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      height: '70px',
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
      @click="$emit('pageId', 'inside')"
      flat icon="tonality" no-caps
      :color="pageId === 'inside' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Микроядра
    //- q-btn(
      @click="jointCreating = !jointCreating"
      color="green" icon="link"
      :style=`{
        width: '50px', height: '50px',
        borderRadius: '50%',
      }`)
    q-btn(
      @click="$emit('pageId', 'names')"
      flat icon="list" no-caps
      :color="pageId === 'names' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Смыслы
    //- q-btn(
      @click="$emit('pageId', 'links')"
      flat icon="link" no-caps
      :color="pageId === 'links' ? 'green' : 'grey-7'"
      :style=`{maxWidth: '60px'}`)
      .row.full-width.justify-center
        small Связи
</template>

<script>
export default {
  name: 'navMobile',
  props: ['pageId'],
}
</script>
