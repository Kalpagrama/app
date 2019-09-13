<template lang="pug">
div(:style=`{height: '38px', paddingLeft: '20px'}`).row.full-width.items-center.justify-between.q-pr-xs
  small.text-grey-6 {{getTime}}
  //- q-btn(round flat dense color="grey-6" icon="more_horiz").q-mr-sm
</template>

<script>
export default {
  name: 'nodeTimestamp',
  props: ['node'],
  computed: {
    getTime () {
      let now = Date.now()
      let from = this.node.createdAt
      // TODO: live ago shit? only when the node is active?
      // if (now - from < 1000 * 60 * 60) return 'minutes'
      // else return this.$date(from)
      return this.$date(from)
    }
  }
}
</script>
