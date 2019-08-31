<template lang="pug">
div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-sm
  //- author avatar
  router-link(
    v-if="nodeFull"
    :to="`/app/user/${nodeFull.author.oid}`"
    :style=`{width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden'}`).row.cursor-pointer
    img(:src="nodeFull.author.thumbUrl[0]" width="100%" height="100%")
  div(
    v-else
    :style=`{width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden'}`).row.bg-grey-5
  //- author name
  .col.q-pl-sm
    router-link(v-if="nodeFull" :to="`/app/user/${nodeFull.author.oid}`")
      span(v-if="nodeFull").q-mr-xs {{nodeFull.author.name}}
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
        {id: 'to_node', name: 'К ядру', color: 'black'},
        {id: 'to_workspace', name: 'Добавить в мастерскую', color: 'black'},
        {id: 'to_chain', name: 'Добавить в цепочку', color: 'black'},
        {id: 'follow', name: 'Подписаться', color: 'black'},
        {id: 'share', name: 'Поделиться', color: 'black'},
        {id: 'report', name: 'Пожаловаться', color: 'red'}
      ]
    }
  },
  methods: {
    async handleAction (a) {
      this.$log('handleAction', a)
      switch (a.id) {
        case 'to_node': {
          this.$log('handleAction', a.id)
          await this.$wait(200)
          this.$router.push(`/app/node/${this.node.oid}`)
          break
        }
        case 'to_workspace': {
          this.$log('handleAction', a.id)
          // TODO: add this node to workspace?
          break
        }
        case 'report': {
          this.$log('handleAction', a.id)
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
        }
      }
    }
  }
}
</script>
