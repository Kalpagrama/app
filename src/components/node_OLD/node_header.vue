<template lang="pug">
div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
  //- author avatar
  router-link(
    v-if="nodeFull"
    :to="`/user/${nodeFull.author.oid}`"
    :style=`{width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden'}`).row.cursor-pointer
    img(:src="nodeFull.author.thumbUrl[0]" width="100%" height="100%")
  div(
    v-else
    :style=`{width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden'}`).row.bg-grey-5
  //- author name
  .col.q-pl-sm
    router-link(v-if="nodeFull" :to="`/user/${nodeFull.author.oid}`")
      span(v-if="nodeFull").q-mr-xs {{$t(nodeFull.author.name)}}
  //- actions
  div
    slot(name="actions")
  k-menu-popup(:name="node.name" :actions="actions" @action="handleAction")
    q-btn(icon="more_horiz" color="grey-5" round flat)
</template>

<script>
import kMenuPopup from 'components/k_menu_popup'

export default {
  name: 'node_header',
  components: {kMenuPopup},
  props: ['node', 'nodeFull'],
  data () {
    return {
      actions: [
        {id: 'to_node', name: 'Перейти к ядру', color: 'black'},
        {id: 'to_workspace', name: 'Добавить в мастерскую', color: 'black'},
        {id: 'to_create', name: 'Создать на основании', color: 'black'},
        // {id: 'to_collection', name: 'Добавить в коллекцию', color: 'black'},
        // {id: 'follow', name: 'Подписаться', color: 'black'},
        // {id: 'share', name: 'Поделиться', color: 'black'},
        {id: 'report', name: 'Пожаловаться', color: 'red'}
      ]
    }
  },
  methods: {
    nodeWorkspace () {
      let r = this.$strip(JSON.parse(JSON.stringify(this.nodeFull)))
      r.thumbUrl = this.node.thumbUrl
      r.createdAt = Date.now()
      this.$store.commit('workspace/addNode', r)
      return r
    },
    async handleAction (a) {
      this.$logD('handleAction', a)
      switch (a.id) {
        case 'to_node': {
          this.$logD('handleAction', a.id)
          await this.$wait(200)
          this.$router.push(`/node/${this.node.oid}`)
          break
        }
        case 'to_workspace': {
          this.$logD('handleAction', a.id, this.node, this.nodeFull)
          this.nodeWorkspace()
          break
        }
        case 'to_create': {
          this.$logD('handleAction', a.id, this.node, this.nodeFull)
          // add to workspace
          let n = this.nodeWorkspace()
          // add to store
          this.$store.commit('workspace/stateSet', ['draft', n])
          await this.$wait(200)
          // go to create
          this.$router.push('/app/create')
          break
        }
        case 'report': {
          this.$logD('handleAction', a.id)
          var r = confirm('Report ?')
          if (!r) return
          this.$logD('reporting...')
          await this.$apollo.mutate({
            mutation: gql`
              mutation deleteNode($oid: OID!) {
                deleteObject (oid: $oid)
              }
            `,
            variables: {
              oid: this.node.oid
            }
          })
          this.$logD('reported!')
        }
      }
    }
  }
}
</script>
