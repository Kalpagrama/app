<template lang="pug">
div(:style=`{height: height+'px'}`).column.full-width.q-px-md
  //- debug
  div(v-if="false").row.full-width.bg-green-1
    small.full-width {{width}}/{{height}}
    small.full-width {{getColumnCount}}/{{getColumnGap}}
  //- header
  div(style=`height: 60px`).row.full-width.items-center.justify-between
    span {{getNodes.length}} nodes
    .col
    q-btn(round flat color="grey-9" icon="search").q-mr-xs
    q-btn(round flat color="grey-9" icon="more_vert")
  //- body
  .col.scroll
    div(:style=`{columnCount: getColumnCount, columnGap: getColumnGap+'px'}`).full-width
      //- div(v-for="(n, ni) in getNodes" :key="ni" @click="nodeClick(n, ni)"
      //-   style=`overflow: hidden; borderRadius: 4px; display: inline-block`
      //-     ).row.items-start.content-start.justify-center.hr.cursor-pointer
      //-   //- .row.full-width
      //-   //-   img(:src="n.objectShort.thumbUrl[0]" width="100%")
      //-   //- .row.full-width
      //-   //-   img(:src="n.objectShort.thumbUrl[1]" width="100%")
      div(v-for="(n, ni) in getNodes" :key="n.oid" @click="nodeClick(n.objectShort, ni)"
        :style=`{
          borderRadius: '4px', display: 'inline-block',
          borderTopLeftRadius: '100%'+getRadius+'px', borderTopRightRadius: '100%'+getRadius+'px',
          borderBottomLeftRadius: '100%'+getRadius+'px', borderBottomRightRadius: '100%'+getRadius+'px'}`
        ).q-pa-sm.bg-white.hr.cursor-pointer.q-mb-md
        node(:node="n.objectShort" style=`width: 100%`)
</template>

<script>
import node from 'components/node'

export default {
  name: 'Content__ContentNodes',
  components: {node},
  props: {
    content: {type: Object},
    now: {type: Number},
    from: {type: Number},
    to: {type: Number},
    width: {type: Number},
    height: {type: Number}
  },
  data () {
    return {
      loading: false,
      nodes: []
    }
  },
  computed: {
    getNodes () {
      return this.nodes.filter(n => {
        if (this.now) {
          let start = n.fragments[0].relativePoints[0]['x']
          let end = n.fragments[0].relativePoints[1]['x']
          return start < this.now && this.now < end
        } else {
          return false
        }
      })
    },
    getColumnCount () {
      return Math.floor(this.width / 140)
    },
    getColumnGap () {
      return 10
    },
    getRadius () {
      return 8
    }
  },
  watch: {
    content: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('content CHANGED', to)
        if (!to) return
        let {data: {contentTopNodes: items}} = await this.$apollo.query({
          query: gql`
            query contentTopNodes($oid: OID!) {
              contentTopNodes (contentOid: $oid) {
                objectShort{
                  oid
                  name
                  type
                  thumbUrl(preferWidth: 600)
                }
                fragments{
                  relativePoints{x}
                  relativeScale
                }
              }
            }
          `,
          variables: {
            oid: this.content.oid
          }
        })
        this.$log('sphereNodes', items)
        this.$set(this, 'nodes', items)
      }
    }
  },
  methods: {
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$router.push(`/app/node/${n.oid}`)
    },
    onDrag (e) {
      this.$log('onDrag', e)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
// query sphereNodes($oid: OID!) {
//   sphereNodes (sphereOid: $oid, pagination: {pageSize: 5}) {
//     totalCount
//     items {
//       oid
//       type
//       thumbUrl (preferWidth: 600)
//       createdAt
//       name
//     }
//     nextPageToken
//   }
// }
</script>
