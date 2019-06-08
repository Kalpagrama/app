<template lang="pug">
div(style=`height: 150px`).row.full-width.no-wrap.scroll.bg-white
  div(
    v-for="(t, ti) in types" :key="t.id" @click="typeClick(t)"
    style=`height: 150px; minWidth: 150px; width: 150px; borderRight: 1px solid #eee`
    ).row.items-center.justify-center.content-center.hr
    q-icon(:name="t.icon" :color="t.color || 'grey'" size="90px")
    .row.full-width.justify-center
      span.text-black {{ t.label }}
</template>

<script>
export default {
  name: 'typeFind',
  data () {
    return {
      types: [
        {id: 'IMAGE', label: 'Изображение', icon: 'image', color: 'green'},
        {id: 'VIDEO', label: 'Видео', icon: 'fab fa-youtube', color: 'red'}
        // {id: 'quote', label: 'Цитата', icon: 'format_quote', color: 'grey'},
        // {id: 'vkpost', label: 'Пост ВК', icon: 'fab fa-vk', color: 'blue'}
      ]
    }
  },
  methods: {
    typeClick (t) {
      this.$log('typeClick', t)
      this.$emit('type', t)
      this.$emit('close')
    }
  }
}
</script>
