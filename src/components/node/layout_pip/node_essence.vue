<style lang="sass" scoped>
.essence
  cursor: pointer
  &:hover
    // background: rgb(100,100,100) !important
</style>

<template lang="pug">
div(
  :style=`{
    minHeight: '50px'
  }`
  ).row.full-width
  .col
    .row.fit.items-center.content-center.q-py-sm.q-pl-md.cursor-pointer
      router-link(
        :to="'/node/'+node.oid"
        ).row.full-width.items-start.content-start.essence
        span(
          :style=`{
            fontSize: '16px',
            userSelect: 'none'
          }`
          ).text-white.text-bold {{ nodeName }}
</template>

<script>
export default {
  name: 'nodeLayoutPip-nodeEssence',
  props: ['node', 'nodeFull', 'visible', 'active', 'mini', 'stateNode'],
  data () {
    return {
    }
  },
  computed: {
    nodeName () {
      return this.node.name
    },
    actions () {
      let res = {
        explore: {
          name: 'Explore node',
          fn: () => {
            this.$log('Explore')
            this.$router.push(`/node/${this.node.oid}`).catch(e => e)
          }
        },
        share: {
          name: 'Share node',
          fn: () => {
            this.$log('Share node')
          }
        },
        subscribe: {
          name: 'Subscribe',
          fn: () => {
            this.$log('Subscribe')
            // TODO: subscribe to node.sphere?
          }
        },
        save: {
          name: 'Save to Workspace',
          fn: () => {
            this.$log('Save to Workspace')
            // TODO: save node to WS
            // need normalization, layer.id, content.id, ?
            // this.$router.push('/workspace/share')
          }
        },
        report: {
          name: 'Report',
          fn: () => {
            this.$log('Report')
            // TODO: report on the whole node
          }
        }
      }
      if (this.stateNode.nodeIsMine) {
        res.delete = {
          name: 'Delete',
          fn: () => {
            this.$log('Delete')
          }
        }
      }
      return res
    }
  },
  methods: {
  }
}
</script>
