<template lang="pug">
.row.full-width.items-start.content-start
  edit-name(:node="node").q-mb-md
  ws-sphere-editor(:item="node")
  edit-category(:node="node")
  q-btn(
    @click="publish()"
    color="green" size="xl" no-caps
    align="center"
    :loading="publishing"
    ).full-width.q-my-sm
    span.text-white.text-bold Опубликовать
  edit-description(:node="node")
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'viewPublish',
  props: ['node'],
  components: {
    editName: () => import('./edit_name.vue'),
    editDescription: () => import('./edit_description.vue'),
    editCategory: () => import('./edit_category.vue')
  },
  data () {
    return {
      publishing: false,
    }
  },
  methods: {
    publishCheck () {
      this.$log('publishCheck')
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        this.publishCheck()
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        // get spheres from workspace
        let spheres = []
        await Promise.all(
          nodeInput.spheres.map(async (sphereId) => {
            let sphere = await this.$rxdb.get(RxCollectionEnum.WS_SPHERE, sphereId)
            if (sphere) spheres.push({name: sphere.name})
          })
        )
        nodeInput.spheres = spheres
        // create node
        let createdNode = await NodeApi.nodeCreate(nodeInput)
        this.$log('publish createdNode', createdNode)
        this.$log('publish done')
        this.publishing = false
        this.$router.replace(`/node/${createdNode.oid}?creating=true`).catch(e => e)
        this.$rxdb.remove(this.node.id)
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
