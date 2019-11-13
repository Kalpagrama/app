<template lang="pug">
k-split(:headerMaxHeight="200" :headerClass="['bg-black']" :bodyClass="['bg-grey-1', 'q-pt-md']")
  template(v-slot:header)
    k-dialog-bottom(ref="contentVideoDialog" mode="actions" :options="contentVideoDialogOptions" @action="contentVideoAction")
    k-video(:fragment="{content: content}" :src="content.url").full-width
      q-btn(
        round dense flat color="white" icon="more_vert" @click="$refs.contentVideoDialog.show()"
        :style=`{background: 'rgba(0,0,0,0.5)'}`)
  template(v-slot:body)
    node-loader(ref="nodeLoader" :query="query" queryKey="sphereNodes" :variables="variables")
      template(v-slot:items=`{items, fetchingMore}`)
        node-list(:nodes="items").q-px-md
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
      }
    }
  },
  computed: {
    contentVideoDialogOptions () {
      return {
        confirm: true,
        confirmName: 'Создать ядро',
        actions: {
          follow: {name: 'Follow'},
          bookmark: {name: 'Save to bookmarks'},
          report: {name: 'Report', color: 'red'}
        }
      }
    }
  },
  methods: {
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
