<template lang="pug">
.column.fit.bg-white
  //- workspace(v-if="false")
  editor-node(v-if="true")
</template>

<script>
// TODO: if user has drafts of nodes in his workspace, he must see them?
import editorNode from './editor_node'
import contentAdd from './content_add'
export default {
  name: 'pageApp_NodeCreate',
  components: {editorNode, contentAdd},
  data () {
    return {
    }
  },
  methods: {
    // TODO: how to create tags
    hashTagCreate (val, done) {
      this.$log('hashTagCreate', val)
      if (val.length > 0) {
        this.hashTagsOptions.push({name: val})
        done(val, 'toggle')
      }
    },
    // TODO: how to filter tags
    hashTagFilter (val, update, abort) {
      this.$log('hashTagFilter')
      update(async () => {
        if (val === '' || val.length < 2) {
          // this.filterOptions = stringOptions
        } else {
          const needle = val.toLowerCase()
          let tags = await this.$apollo.query({
            query: gql`
              query autocomplete ($searchStr: String!) {
                autocomplete(objectTypes: WORD, searchStr: $searchStr) {
                  name
                  oid
                }
              },
            `,
            variables: {
              searchStr: needle
            }
          })
          this.$log('tags', tags)
          this.hashTagsOptions = tags.data.autocomplete
        }
      })
    },
    handleNext () {
      this.$log('handleNext')
    },
    async nodeCreate () {
      // TODO: error from  server? error wrong?
      // save to drafts? and how to see your drafts?
      // some drafts can be what?
      this.$log('nodeCreate start')
      let u1 = await this.$refs.addOne.photoUpload()
      let u2 = await this.$refs.addTwo.photoUpload()
      let res = await this.$apollo.mutate({
        mutation: gql`
          mutation nodeCreate ($node: NodeInput!) {
            # impersonate(login: "4321ip@mail.ru")
            nodeCreate (node: $node) {
              oid
              type
              name
            }
          }
        `,
        variables: {
          node: {
            name: this.core.name,
            fragments: [{oid: u1.oid, relativePoints: [], relativeScale: 1000}, {oid: u2.oid, relativePoints: [], relativeScale: 1000}],
            hashTags: []
          }
        }
      })
      this.$log('nodeCreate', res)
      this.$log('nodeCreate done')
    },
    onReady (e) {
      this.$log('onReady', e)
      e.target.playVideo()
    },
    onChange (e) {
      this.$log('onChange', e)
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
