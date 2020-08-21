<template lang="pug">
.row.full-width.q-pa-md
  span(:style=`{fontSize: '18px',}`).text-white.text-bold {{ contentWorkspace.name }}
  .row.full-width
    .row.full-width
      span.text-white {{ contentKalpa.contentSource }}
  //- spheres
  .row.full-width.q-py-md
    .row.full-width
      span.text-white Spheres
  div(:style=`{height: '100px',}`).row.full-width
  //- go to original
  .row.full-width.justify-center.q-pa-md
    q-btn(color="green" no-caps dense).q-px-sm Перейти на оригинал
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
