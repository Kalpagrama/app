<template lang="pug">
.column.fit
  //- div(:style=`{height: '60px'}`).row.full-width
  k-dialog-bottom(ref="nodeActionDialog" :options="nodeDialogOptions" @action="nodeAction")
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(i, ii) in nodes" :key="i.item.oid" @click="nodeClick(i, ii)"
        :style=`{
          height: '60px', borderRadius: '10px', overflow: 'hidden',
          border: ii === nodeIndex ? '3px solid #4caf50' : '3px solid #eee'}`
        ).row.full-width.items-center.justify-center.bg-white.q-mb-md.cursor-pointer
        span {{ i.item.name }}
</template>

<script>
export default {
  name: 'wsNodes',
  data () {
    return {
      nodeIndex: -1,
      nodeDialogOptions: {
        header: false,
        confirm: true,
        confirmName: 'Edit',
        actions: {
          delete: {name: 'Delete', color: 'red'}
        }
      }
    }
  },
  computed: {
    nodes () {
      return this.$store.getters.currentUser.workspace.nodes
        .reduce((acc, val) => {
          if (val.fragments.length === 2) {
            acc.push({
              type: 'node',
              item: val
            })
          }
          return acc
        }, [])
    }
  },
  methods: {
    async nodeAction (action) {
      this.$log('nodeAction', action)
      this.$refs.nodeActionDialog.hide()
      await this.$wait(600)
      switch (action) {
        case 'confirm': {
          this.nodeUse(this.nodes[this.nodeIndex], this.nodeIndex)
          break
        }
        case 'delete': {
          this.nodeDelete(this.nodes[this.nodeIndex])
          break
        }
      }
      this.nodeIndex = -1
    },
    async nodeDelete (item) {
      this.$log('nodeDelete', item)
      let oid = item.item.oid
      this.$log('nodeDelete OID', oid)
      let res = await this.$store.dispatch('workspace/wsNodeDelete', oid)
      this.$log('res', res)
    },
    async fragmentDelete (item) {
      this.$log('fragmentDelete', item)
      let node = item.node
      node.fragments[item.fragmentIndex] = null
      let res = await this.$store.dispatch('workspace/wsNodeSave', JSON.parse(JSON.stringify(node)))
      this.$log('res', res)
    },
    async nodeClick (i, ii) {
      this.$log('nodeClick', i, ii)
      this.nodeIndex = ii
      this.$refs.nodeActionDialog.show()
    },
    async nodeUse (i, ii) {
      this.$log('nodeClick', i, ii)
      this.$store.commit('workspace/stateSet', ['wsItem', {type: 'node', item: JSON.parse(JSON.stringify(i.item))}])
      await this.$wait(300)
      this.$router.push('/create')
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
