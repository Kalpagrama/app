<template lang="pug">
component(
  :is="$store.state.node.layouts[node.meta.layout].component"
  :index="index" :zIndex="zIndex"
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
    noSpheres: {type: Boolean}
  },
  data () {
    return {
      nodeFull: null,
      nodeRating: false,
      nodeRates: [
        {id: 1, name: 'Нет', rate: 0.0, icon: 'gps_off', opacity: 1},
        {id: 2, name: 'Скорее нет', rate: 0.25, icon: 'gps_not_fixed', opacity: 0.7},
        {id: 3, name: 'Может быть', rate: 0.5, icon: 'gps_not_fixed', opacity: 1},
        {id: 4, name: 'Скорее да', rate: 0.75, icon: 'gps_fixed', opacity: 0.7},
        {id: 5, name: 'Да', rate: 1.0, icon: 'gps_fixed', opacity: 1}
      ],
      nodeSharing: false,
      nodeChaining: false,
      nodeWorkspacing: false,
      fragmentActive: 0,
      nodeTemplateSet: undefined
    }
  },
  computed: {
  },
  watch: {
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        if (to) {
          // this.$log('nodeFullReady CHANGED')
          this.nodeFull = to
          this.$emit('nodeFull', this.nodeFull)
        }
      }
    },
    needFull: {
      immediate: true,
      async handler (to, from) {
        if (to === true && !this.nodeFullReady) {
          // this.$log('nodeFull CHANGED', this.node.name)
          this.nodeFull = await this.nodeLoad(this.node.oid)
          this.$emit('nodeFull', this.nodeFull)
        }
      }
    }
  },
  methods: {
    async nodeLoad (oid) {
      // this.$log('nodeLoad start', this.index, this.node.name)
      let { data: { objectList: [nodeFull] } } = await this.$apollo.query({
        query: gql`
          query getExtendedNodesProps($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              createdAt
              ...on Node {
                rate
                rateUser
                viewCnt
                author {
                  oid
                  type
                  name
                  thumbUrl(preferWidth: 50)
                  __typename
                }
                spheres {
                  oid
                  name
                }
                categories
                fragments {
                  uid
                  name
                  url
                  content {
                    oid
                    type
                    name
                    thumbUrl(preferWidth: 600)
                    ...on Video {
                      url
                      urlType
                      width
                      height
                      duration
                    }
                    ...on Image {
                      url
                    }
                  }
                  relativePoints { x y z }
                  relativeScale
                }
              }
            }
          }
        `,
        variables: {
          oid: oid
        },
        fetchPolicy: 'cache-first'
      })
      // this.$log('nodeLoad done', this.index, this.node.name)
      return nodeFull
    }
  }
}
</script>
