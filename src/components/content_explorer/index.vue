<template lang="pug">
k-split(ref="kSplit" :headerMaxHeight="200" :headerClass="['bg-black']" :bodyClass="['bg-grey-1']" @scrollTop="scrollTop = $event")
  template(v-slot:header)
    q-dialog(ref="nodePreviewDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down" @hide="node = null")
      div(@click.self="$refs.nodePreviewDialog.hide()").row.fit.items-end.content-end.q-px-sm.q-pt-xl.q-pb-sm
        div(:style=`{borderRadius: '10px'}`).column.full-width.bg-white
          //- h1 Hello node
          node(v-if="node" :node="node" :width="300" :active="true" :needFull="true")
    k-dialog-bottom(ref="contentVideoDialog" mode="actions" :options="contentVideoDialogOptions" @action="contentVideoAction")
    k-video(:fragment="{content: content}" :src="content.url").full-width
      q-btn(
        round dense flat color="white" icon="more_vert" @click="$refs.contentVideoDialog.show()"
        :style=`{background: 'rgba(0,0,0,0.5)'}`)
    div(v-if="false" :style=`{marginTop: '-20px', height: '40px', paddingLeft: '30px', paddingRight: '30px'}`).row.full-width.items-center
      div(:style=`{height: '20px', borderRadius: '4px'}`).row.full-width.bg-red
  template(v-slot:body)
    //- scroll to top
    div(
      v-show="scrollTop > 100"
      @click="$refs.kSplit.scrollTo(0)"
      :style=`{position: 'sticky', top: '0px', height: '50px'}`
      ).row.full-width.items-center.justify-center
      q-btn(round flat color="green" size="md" )
        q-icon(name="keyboard_arrow_up" size="30px" color="green")
      //- span {{ scrollTop }}
    //- content header
    div(:style=`{height: headerHeight+'px', borderBottom: '1px solid #eee'}`).row.full-width.items-start.content-start.justify-start.q-px-sm.q-mb-md
      div(:style=`{height: '60px'}`).row.full-width
        .col.full-height
          .row.fit.items-center
            span.text-bold {{ content.name | cut(50) }}
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          q-btn(round flat icon="keyboard_arrow_down" @click="headerToggle()")
    node-loader(ref="nodeLoader" :query="query" queryKey="sphereNodes" :variables="variables")
      template(v-slot:items=`{items, fetchingMore}`)
        node-list(:nodes="items" @nodeClick="nodeClick").q-px-md
    div(:style=`{height: '200px'}`).row.full-width
</template>

<script>
import contentVideo from './content_video'

export default {
  name: 'contentExplorer',
  components: {contentVideo},
  props: {
    content: {type: Object},
    inEditor: {type: Boolean, default () { return false }}
  },
  data () {
    return {
      query: gql`
        query contentNodesNew ($oid: OID!) {
          sphereNodes (sphereOid: $oid, pagination: {pageSize: 100}, sortStrategy: HOT) {
            items {
              oid
              type
              name
              createdAt
              thumbUrl(preferWidth: 600)
              meta {
                ...on MetaNode {
                  layout
                  fragments { uid width height color thumbUrl(preferWidth: 600) }
                }
              }
            }
            count
            totalCount
            nextPageToken
          }
        }
      `,
      variables: {
        oid: this.content.oid
      },
      scrollTop: 0,
      node: null,
      headerHeight: 60
    }
  },
  computed: {
    contentVideoDialogOptions () {
      return {
        confirm: true,
        confirmName: 'Создать ядро',
        actions: {
          follow: {name: 'Follow'},
          bookmark: {name: 'Save to notes'},
          report: {name: 'Report', color: 'red'}
        }
      }
    }
  },
  methods: {
    headerToggle () {
      this.$log('headerToggle')
      if (this.headerHeight === 60) {
        this.$tween.to(this, 0.3, {headerHeight: 300})
      } else {
        this.$tween.to(this, 0.3, {headerHeight: 60})
      }
    },
    nodeClick (n) {
      this.$log('nodeClick', n)
      this.$refs.nodePreviewDialog.show()
      this.node = n
    },
    async contentVideoAction (a) {
      this.$log('contentVideoAction', a)
      switch (a) {
        case 'follow': {
          let res = await this.$store.dispatch('subscriptions/subscribe', this.content.oid)
          this.$log('res', res)
          break
        }
        case 'bookmark': {
          break
        }
        case 'report': {
          break
        }
        case 'confirm': {
          this.$log('CREATE!')
          break
        }
      }
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
