<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: '600px'}`).row.full-width.items-start.content-start.q-mb-xl
    //- .row.full-width.q-px-sm
      edit-description(
        :node="node"
        :style=`{
          maxWidth: '600px',
        }`)
    .row.full-width.q-px-sm.q-py-sm
      edit-category(:node="node")
    .row.full-width.q-px-sm
      ws-sphere-editor(:item="node")
    .row.full-width.q-py-md.q-px-sm.q-mt-md
      q-btn(
        @click="publish()"
        color="green" size="xl" no-caps
        align="center"
        :loading="publishing"
        :style=`{maxWidth: '100%'}`
        ).full-width
        span.text-white.text-bold Опубликовать
    .row.full-width.q-px-sm
      edit-description(
        :node="node"
        :style=`{
          maxWidth: '600px',
        }`)
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'viewPublish',
  props: ['node'],
  components: {
    editDescription: () => import('../edit_description.vue'),
    editCategory: () => import('../edit_category.vue')
  },
  data () {
    return {
      publishing: false,
      meta: {
        isPrivate: false,
        isMature: false
      }
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
