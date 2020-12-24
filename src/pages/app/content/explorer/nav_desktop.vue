<template lang="pug">
.row.full-width.justify-center.q-pt-sm
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      height: '60px',
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.b-40
    q-btn(round flat color="white" icon="west").q-mx-sm
    span(:style=`{fontSize: '18px'}`).text-white.text-bold Контент
    .col.full-height.q-pl-sm
      q-tabs(
        :value="pageId" @input="$emit('pageId', $event)"
        no-caps active-color="green" inline-label
        ).fit
        q-tab(name="nodes" icon="panorama_fish_eye" label="Ядра и связи")
        q-tab(name="drafts" icon="tonality" label="Заметки")
        q-tab(name="similar" icon="grain" label="Похожее")
</template>

<script>
export default {
  name: 'navDesktop',
  props: ['pageId'],
  data () {
    return {
    }
  }
}
</script>
