<template lang="pug">
div(
  @click.self="$emit('close')"
  ).row.full-width
  div(
    :style=`{
      //- maxWidth: '60%',
      borderRadius: '10px',
      background: 'rgba(30,30,30,0.9)',
    }`
    ).column.fit
    .col.full-width.scroll
      .row.full-width.items-start.content-start
        //- chapter
        div(
          v-for="chapter in toc" :key="chapter.href"
          ).row.full-width
          //- chapter header
          div(
            @click="chapter.go(), $emit('close')"
            ).row.full-width.q-px-sm.q-py-md.cursor-pointer
            span(:style=`{fontSize: '14px', userSelect: 'none', userSelect: 'none',}`).text-white.text-bold.q-ml-xs {{ chapter.label }}
          //- sub chapters
          .row.full-width.items-start.content-start
            q-btn(
              @click="subchapter.go(), $emit('close')"
              v-for="subchapter in chapter.subitems"
              :key="subchapter.href"
              flat dense no-caps
              :color="tocId === subchapter.id ? 'green' : 'white'"
              align="left"
              ).full-width.q-px-sm
              span(:style=`{fontSize: '14px', textAlign: 'start', userSelect: 'none'}`) {{ subchapter.label }}
</template>

<script>
export default {
  name: 'playerToc',
  props: ['toc', 'tocId'],
  data () {
    return {
    }
  }
}
</script>
