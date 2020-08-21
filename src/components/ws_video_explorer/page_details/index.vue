<template lang="pug">
.row.full-width.items-start.content-start.q-pa-md
  span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentWorkspace.name }}
  .row.full-width.q-py-md
    .row.full-width
      q-btn(color="green" no-caps dense).q-px-sm Перейти на оригинал
    .row.full-width.q-px-sm
      small(:style=`{}`).text-white {{ contentKalpa.contentSource }}
  //- spheres
  .row.full-width.q-py-md
    .row.full-width.q-px-sm
      span.text-white.text-bold Сферы
</template>

<script>
export default {
  name: 'wsContentExplorer_pageDetails',
  props: ['mode', 'contentWorkspace', 'contentKalpa'],
  data () {
    return {
    }
  },
  methods: {
    gotToOriginal () {
      let urlStart = 'https://www.youtube.com/watch?v=Ah0Ys50CqO8'
    }
  }
}
</script>
