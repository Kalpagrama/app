<template lang="pug">
div(:style=`{height: $store.state.ui.width+'px'}`).row.full-width.q-pa-md
  div(style=`borderRadius: 10px; border: 5px solid #eee; overflow: hidden`).column.fit.items-center.justify-center
    .col.full-width.bg-green
      .row.fit.items-center.justify-center
      span.text-white fragment one
    div(style=`height: 40px`).row.full-width.items-center.justify-center
      span Суть такова
    .col.full-width.bg-green
      .row.fit.items-center.justify-center
        span.text-white fragment two
</template>

<script>
export default {
  name: 'editorVideo',
  data () {
    return {
    }
  }
}
</script>
