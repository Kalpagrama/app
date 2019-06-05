<template lang="pug">
div(:style=`{
  height: $store.state.ui.width+160+'px',
  maxWidth: $store.state.ui.width+'px'}`
  ).column.full-width.q-mt-xs.q-mb-sm.bg-white.q-px-md.bg-grey-1
  //- node author
  div(style=`height: 60px`).row.full-width.items-center
    div(style=`height: 35px; width: 35px; borderRadius: 50%`).row.bg-primary.q-ml-xs
    .col
      .row.fit.items-center.q-px-sm
        span {{ nodeFull.author.name }}
  //- node body
  node(:node="nodeFull" :types="getTypes")
  //- div(style=`height: 200px`).row.full-width
  //-   img(:src="node.thumbUrl[0]" width="100%" height="100%")
  //- div(style=`height: 50px`).row.full-width
  //-   span {{ node.name }}
  //- div(style=`height: 200px`).row.full-width
  //-   img(:src="node.thumbUrl[1]" width="100%" height="100%")
  //- node spheres
  div(style=`order: 0; height: 50px`).row.full-width
    div(style=`height: 50px; maxWidth: 100%`).row.full-width.items-center.no-wrap.scroll
      div(v-for="(s, si) in spheres" :key="s.oid" style=`height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-3
        span #
        span sphere
  //- node actions
  //- div(style=`height: 40px`).row.full-width.items-center.justify-between
  //-   div.row.full-height.items-center
  //-     q-btn(icon="track_changes" flat round dense)
  //-     span.q-mb-xs 3.45
  //-   .col
  //-     .row.fit.items-center.justify-end
  //-       div.row.full-height.items-center
  //-         q-btn(icon="share" flat round dense).q-mr-md
  //-       div.row.full-height.items-center
  //-         q-btn(icon="more_horiz" flat round dense)
</template>

<script>
import node from 'components/node'
export default {
  name: 'nodeCard',
  components: {node},
  props: {
    node: {
      type: Object
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
      nodeFull: {
        author: {name: ''},
        fragments: [
          {content: { type: 'none' }},
          {content: { type: 'none' }}
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
      this.$router.push({name: 'node'})
    }
  },
  async mounted () {
    this.$log('mounted', this.node)
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
  }
}
</script>
