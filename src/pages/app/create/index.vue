<template lang="pug">
div(:style=`{height: 'calc(var(--vh, 1vh) * 100)'}`).column.full-width.bg-grey-4
  .col.full-width
    node-creator
</template>

<script>
import nodeCreator from 'components/node_creator'

export default {
  name: 'pageApp_сreate',
  props: [],
  components: {nodeCreator},
  data () {
    return {
    }
  },
  watch: {
    // '$route': {
    //   deep: true,
    //   immediate: true,
    //   async handler (to, from) {
    //     this.$log('$route CHANGED', to)
    //     let draft = null
    //     let draftStore = this.$store.state.workspace.draft
    //     if (draftStore) {
    //       draft = this.$store.state.workspace.draft
    //     } else {
    //       draft = JSON.parse(localStorage.getItem('nodeDraft'))
    //     }
    //     this.$log('DRAFT', draft)
    //     this.draft = draft
    //   }
    // }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
