<template lang="pug">
.column.fit
  div(
    v-if="height > 100"
    :style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-md
    span(:style=`{borderRadius: '10px'}`).text-bold.text-white {{ meta.content.name }}
  div(
    v-if="height > 120"
    ).col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-md
      span.text-white {{text}}
</template>

<script>
export default {
  name: 'videoComposer_extraNodes',
  props: ['composition', 'meta', 'player', 'height'],
  data () {
    return {
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic'
    }
  },
  computed: {
  }
}
</script>
