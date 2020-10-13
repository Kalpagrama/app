<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: '600px'}`).row.full-width.items-start.content-start
    //- .row.full-width.q-py-sm
      q-btn(
        @click="$emit('viewId', 'add')"
        flat dense color="grey-2" no-caps icon="keyboard_arrow_left"
        :style=`{
        }`).q-pr-sm.q-py-sm вернуться к образам
    //- .row.full-width.q-px-sm
      edit-description(
        :value="node.description" @input="node.description = $event"
        :style=`{
          maxWidth: '600px',
        }`)
    .row.full-width.q-px-sm.q-py-sm
      edit-category(:node="node")
    .row.full-width.q-px-sm
      ws-sphere-editor(:item="node")
    //- .row.full-width.q-px-sm
      q-toggle(
        v-model="meta.isPrivate"
        dark color="green" label="Private").text-grey-6
      q-toggle(
        v-model="meta.isMature"
        dark color="green" label="Mature").text-grey-6
    .row.full-width.q-py-md.q-px-sm.q-mt-md
      q-btn(
        @click="publish()"
        color="green" size="xl" no-caps
        push align="center"
        :loading="publishing"
        :style=`{maxWidth: '100%'}`
        ).full-width
        span.text-white.text-bold Опубликовать
    .row.full-width.q-py-md
      q-btn(
        @click="nodeDelete()"
        flat dense color="red" no-caps).q-px-sm Удалить
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

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
      meta: {
        isPrivate: false,
        isMature: false
      }
    }
  },
  methods: {
    async nodeDelete () {
      this.$log('nodeDelete')
      this.$q.dialog({
        dark: true,
        title: 'Удалить ядро ?!',
        message: 'Это нельзя отменить',
        persistent: true,
        'content-style': {
          borderRadius: '10px',
          overflow: 'hidden',
        },
        ok: {
          flat: false,
          color: 'green',
          label: 'Удалить',
          'no-caps': true
        },
        cancel: {
          flat: true,
          color: 'green',
          label: 'Отмена',
          'no-caps': true
        },
      }).onOk(async () => {
        await this.$rxdb.remove(this.node.id)
        this.$router.push('/workspace/nodes/drafts').catch(e => e)
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    },
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
