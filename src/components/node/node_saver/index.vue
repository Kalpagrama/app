<template lang="pug">
.row.full-width
  slot(name='editor' :node="node" :nodeNew="nodeNew")
</template>

<script>
import { debounce } from 'quasar'

export default {
  name: 'nodeSaver',
  props: ['value', 'mode'],
  data () {
    return {
      nodeChanged: false,
      nodeSaving: false,
      nodeSavingError: null,
      node: null,
      nodeNew: {
        name: '',
        revision: 0,
        layout: 'PIP',
        category: 'FUN',
        spheres: [],
        compositions: []
      }
    }
  },
  watch: {
    value: {
      deep: true,
      immediate: true,
      handler (to, from) {
        if (to) {
          // node changed by server
          if (this.node && this.node.revision !== to.revision) {
            // если пользователь успел изменить что-либо
            if (this.nodeChanged) {
              this.$log('User changed something! try to save!')
              this.nodeSaveDebounce()
            }
            // user dont changed anything
            else {
              this.$log('Set this.node value from vuex 1', to)
              this.node = JSON.parse(JSON.stringify(to))
            }
          } else {
            this.$log('Set this.node value from vuex 2')
            if (!this.node) this.node = JSON.parse(JSON.stringify(to))
          }
        } else {
          this.$log('Set this.node value from vuex 3')
          this.node = JSON.parse(JSON.stringify(this.nodeNew))
        }
      }
    },
    node: {
      deep: true,
      handler (to, from) {
        // this.$log('node CHANGED', to)
        if (to) {
          // user changed node
          if (!from || from.revision === to.revision) {
            // this.$log('User changed node: ', to.revision, to.name)
            this.nodeChanged = true
            this.nodeSaveDebounce()
          }
        }
      }
    }
  },
  methods: {
    async nodeSaveImmediate () {
      try {
        if (!this.nodeChanged) return
        this.$log('nodeSave start', this.node.revision, this.node.name)
        this.nodeSaving = true
        let res = await this.$store.dispatch('workspace/wsNodeSave', this.node)
        this.$log('nodeSave res', res.revision, res.name, res)
        if (!res.revision) this.$q.notify({color: 'red', textColor: 'white', message: 'No revision!!!'})
        if (!this.value) {
          this.$log('nodeSave SET WS ITEM')
          this.$router.push({params: {oid: res.oid}})
          this.$store.commit('workspace/stateSet', ['itemType', 'node'])
          this.$store.commit('workspace/stateSet', ['item', res])
        }
        this.$log('nodeSave done', res.revision, res.name)
        this.nodeSaveWs()
        this.nodeSavingError = null
      } catch (e) {
        this.$logE('nodeSave error', e)
        this.nodeSavingError = e
      } finally {
        this.nodeSaving = false
        this.nodeChanged = false
      }
    },
    nodeSaveWs () {
      this.$log('nodeSaveWs')
      // if ctx in content-container, or not in content-container
      // we go througn compositoins and layers,
      // find their containers. and save them to ws...
    }
  },
  created () {
    this.nodeSaveDebounce = debounce(this.nodeSaveImmediate, 1000)
  }
}
</script>
