<template lang="pug">
.column.fit
  div(:style=`{minHeight: '70px'}`).row.full-width
    div(:style=`{height: '70px'}`).row.full-width.items-center.justify-between.q-px-md
      q-btn(round color="primary" :icon="source.icon" @click="$emit('sourcesToggle')")
      span.text-bold {{ source.name }}
      q-btn(round flat icon="more_horiz" color="grey-8")
    //- div(:style=`{height: '70px'}`).full-width.scroll
    //-   .row.full-width.no-wrap
    //-     div(
    //-       v-for="(t, ti) in $store.state.workspace.contentTypes" :key="ti"
    //-       :style=`{width: '70px', minWidth: '70px', height: '70px'}`).row.items-center.justify-center
    //-         q-btn(round  :style=`{background: t.color, color: 'white'}` :icon="t.icon")
  .col.scroll
    .row.full-width.q-px-sm
      input(style=`display: none` ref="fileinput" type="file")
      q-btn(icon="attachment" color="primary" style=`height: 60px; borderRadius: 10px; overflow: hidden` no-caps @click="$refs.fileinput.click()").full-width.q-my-xl
        span.text-white.text-bold.q-ml-sm Выбрать файл
    //- div(body-scroll-lock-ignore).col.scroll
    //-   .row.full-width.items-start.content-start
    //-     div(
    //-       v-for="(i, ii) in 100" :key="ii"
    //-       :style=`{height: '70px'}`).row.full-width
    //-       span {{i}}
</template>

<script>
export default {
  name: 'contentFinder__sourceDevice',
  props: ['source', 'progress'],
  data () {
    return {
    }
  },
  methods: {
    async uploadFile (file, length) {
      this.$log('uploadFile')
      let {data: {uploadContentFile: {oid}}} = await this.$apollo.mutate({
        client: 'upload',
        mutation: gql`
          mutation uploadContentFile ($file: Upload!, $length: Float!) {
            uploadContentFile (file: $file, length: $length) { oid }
          }
        `,
        variables: {
          file: file,
          length: length
        }
      })
      return oid
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
