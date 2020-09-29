<template lang="pug">
.row.full-width.items-start.content-start.justify-center.q-pt-md.q-px-sm
  div(:style=`{maxWidth: '600px'}`).row.full-width.items-start.content-start.q-px-sm
    .row.full-width
      edit-description(
        :value="node.description" @input="node.description = $event"
        :style=`{
          maxWidth: '600px',
        }`)
    .row.full-width.q-py-sm
      edit-category(:node="node")
    .row.full-width.q-py-md
      q-btn(
        @click="publish()"
        color="green" size="xl" no-caps
        push align="center"
        :loading="publishing"
        :style=`{maxWidth: '100%'}`
        ).full-width
        span.text-white.text-bold Publish it
    .row.full-width.q-py-xl
      q-btn(
        @click="nodeDelete()"
        flat dense color="red" no-caps).q-px-sm Delete node
</template>

<script>
import { NodeApi } from 'src/api/node'
// import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'viewPublish',
  props: ['node'],
  components: {
    editDescription: () => import('./edit-description.vue'),
    editCategory: () => import('./edit-category.vue')
  },
  data () {
    return {
      publishing: false,
    }
  },
  methods: {
    nodeDelete () {
      this.$log('nodeDelete')
    },
    publishCheck () {},
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        let nodeInput = this.node
        let createdNode = await NodeApi.nodeCreate(nodeInput)
        this.$log('publish createdNode', createdNode)
        this.$log('publish done')
        this.publishing = false
        // this.$router.replace(`/node/${createdNode.oid}?creating=true`).catch(e => e)
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
        this.$q.notify({type: 'negative', position: 'top', message: e.toString()})
      }
    }
  }
}
</script>
