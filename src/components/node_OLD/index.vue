<template lang="pug">
component(
  :is="$store.state.node.layouts[node.meta.layout].component"
  @nodeClick="$emit('nodeClick')"
  :index="index" :zIndex="zIndex" @action="nodeAction($event)" :widthWrapper="width" :muted="muted"
  :node="node" :nodeFull="nodeFull" :active="active" :needFull="needFull"
  :noActions="noActions" :noTimestamp="noTimestamp" :noName="noName" :noSpheres="noSpheres")
</template>

<script>
import nodeTemplateHoriz from './node_template_horiz'
import nodeTemplateVert from './node_template_vert'
import nodeTemplatePip from './node_template_pip'
import nodeTemplateCards from './node_template_cards'
import kMenuPopup from 'components/k_menu_popup'

export default {
  components: {nodeTemplateHoriz, nodeTemplateVert, nodeTemplatePip, nodeTemplateCards, kMenuPopup},
  name: 'node',
  props: {
    zIndex: {type: Number, default () { return 200 }},
    index: {type: Number, default () { return 0 }},
    node: {type: Object},
    needFull: {type: Boolean},
    nodeFullReady: {type: Object},
    active: {type: Boolean},
    template: {type: String},
    inCreator: {type: Boolean},
    noActions: {type: Boolean},
    noTimestamp: {type: Boolean},
    noName: {type: Boolean},
    noSpheres: {type: Boolean},
    width: {type: Number},
    muted: {type: Boolean}
  },
  data () {
    return {
      nodeFull: null,
      actionFragment: null
    }
  },
  computed: {
  },
  watch: {
    active: {
      handler (to, from) {
        this.$logD('active CHANGED', to)
      }
    },
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        if (to) {
          // this.$logD('nodeFullReady CHANGED')
          this.nodeFull = to
          this.$emit('nodeFull', this.nodeFull)
        }
      }
    },
    // нужны данные по полному ядру
    needFull: {
      immediate: true,
      async handler (to, from) {
        if (to === true && !this.nodeFullReady) {
          this.$logD('needFull CHANGED', this.node.name)
          this.nodeFull = await this.nodeLoad(this.node.oid)
          this.$emit('nodeFull', this.nodeFull)
        }
      }
    },
  },
  methods: {
    nodeAction ([action, payload]) {
      this.$logD('nodeAction', action, payload)
      this.actionFragment = payload
      this.$refs.nodeActionDialog.show()
    },
    action (e) {
      this.$logD('action', e)
      switch (e) {
        case 'subscribe': {
          this.$logD('SUBSCRIBE')
          break
        }
        case 'contentExplore': {
          this.$logD('CONTENT EXPLORE')
          this.$router.push(`/content/${this.actionFragment.content.oid}`)
          break
        }
        case 'confirm': {
          this.$logD('CONFIRM')
          this.$root.$emit('create')
          break
        }
      }
    },
    nodeBookmark () {
      this.$logD('nodeBookmark')
    },
    nodeContent () {
      this.$logD('nodeContent')
    },
    nodeFragment () {
      this.$logD('nodeFragment')
    },
    async nodeLoad (oid) {
      this.$logD('nodeLoad start3', this.index, oid)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      } catch (err){
        // this.$logD('nodeLoad error', err, this.index, this.node.oid)
        this.$logE('node', 'nodeLoad error', err)
        node = null
      }
      this.$logD('nodeLoad done', this.index, this.node.oid)
      return node
    }
  }
}
</script>
