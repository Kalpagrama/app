<template lang="pug">
.column.fit.bg-white
  //- div(style=`height: 50px`).row.full-width.justify-center.bg-grey-3
  //-   div(style=`maxWidth: 1110px`).row.full-width
  .col
    router-view
</template>

<script>
// user drafs in workspace
import editorNode from 'components/editor_node'
export default {
  name: 'pageApp_Create',
  components: {editorNode},
  data () {
    return {
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
