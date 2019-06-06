<template lang="pug">
div(:style=`{
  height: $store.state.ui.width+160+'px',
  maxWidth: $store.state.ui.width+'px'}`
  ).column.full-width.q-mt-xs.q-mb-sm.bg-white.q-px-md.bg-grey-1
  //- node author
  div(style=`height: 60px`).row.full-width.items-center
    div(style=`height: 35px; width: 35px; borderRadius: 50%`).row.bg-grey-3.q-ml-xs
    .col.q-px-sm
      div(v-if="nodeFull.author.name.length > 0").row.fit.items-center
        span {{ nodeFull.author.name }}
        .row.full-width
          small.text-grey-8 14.05.19 18:18 923892
      div(v-else).row.full-width
        div(style=`minHeight: 18px; height: 18px; borderRadius: 8px; width: 230px`).row.items-center.bg-grey-3.q-mb-xs
        div(style=`minHeight: 15px; height: 15px; borderRadius: 8px; width: 180px`).row.items-center.bg-grey-3
  //- node body
  node(:node="node" :nodeFull="nodeFull" :types="getTypes")
  //- node spheres
  div(v-if="nodeFull.spheres.length > 0" style=`height: 50px`).row.full-width
    div(style=`height: 50px; maxWidth: 100%`).row.full-width.items-center.no-wrap.scroll
      div(v-for="(s, si) in nodeFull.hspheres" :key="s.oid" style=`height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-3
        span #
        span sphere
  //- node actions
  div(style=`height: 40px`).row.full-width.items-center.justify-between
    div.row.full-height.items-center
      q-btn(icon="track_changes" flat round dense)
      span.q-mb-xs {{ nodeFull.rate || 0 }}
    .col
      .row.fit.items-center.justify-end
        div.row.full-height.items-center
          q-btn(icon="share" flat round dense).q-mr-md
        div.row.full-height.items-center
          q-btn(icon="more_horiz" flat round dense)
</template>

<script>
import node from 'components/node'
export default {
  name: 'nodeCard',
  components: {node},
  props: {
    node: {
      type: Object, required: true
    }
  },
  data () {
    return {
      spheres: [
        {oid: 't1', name: 'смерть'},
        {oid: 't2', name: 'сталин'},
        {oid: 't3', name: 'справедливость'},
        {oid: 't4', name: 'неприкосновенность'}
      ],
      nodeLoaded: false,
      nodeFull: {
        author: {name: ''},
        fragments: [
          {content: { type: 'none', poster: this.node.thumbUrl[0] }},
          {content: { type: 'none', poster: this.node.thumbUrl[1] }}
        ],
        spheres: []
      }
    }
  },
  computed: {
    getTypes () {
      return {
        one: this.nodeFull.fragments[0]['content']['type'] || 'none',
        two: this.nodeFull.fragments[1]['content']['type'] || 'none'
      }
    }
  },
  methods: {
    nodeClick () {
      this.$log('nodeClick', this.item)
      // this.$router.push({name: 'node'})
    },
    async nodeLoad () {
      this.$log('nodeLoad start')
      // console.time('nodeLoad')
      let { data: { objectList: nodeFull } } = await this.$apollo.query({
        query: gql`
          query getExtendedNodesProps($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              ...on Node {
                rate
                # viewCnt
                # rateUser
                author {
                  oid
                  type
                  name
                  thumbUrl(preferWidth:50, preferHeight: 50)
                  __typename
                }
                spheres {
                  oid
                  name
                }
                fragments {
                  content {
                    oid
                    type
                    name
                    thumbUrl(preferWidth:400, preferHeight: 200)
                    ...on Video {
                    url
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
          oid: this.node.oid
        }
      })
      this.$log('nodeFull', nodeFull[0])
      this.nodeFull = nodeFull[0]
      this.$log('nodeLoad done')
      // console.timeEnd('nodeLoad')
    }
  },
  watch: {
    node: {
      deep: true,
      handler (to, from) {
        // this.$log('node CHANGED', to)
        if (to.visible === true && this.nodeLoaded === false) {
          this.nodeLoaded = true
          this.nodeLoad()
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.$log('node', this.node)
  }
}
</script>
