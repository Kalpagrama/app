<template lang="pug">
.row.full-width.justify-center.q-px-sm
  div(
    :style=`{
      position: 'relative', minHeight: '500px',
      maxWidth: $store.state.ui.pageMaxWidth+'px',
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.items-between.content-between.q-px-md.b-40
    .row.full-width.q-py-md
      ws-sphere-editor(:item="sphere" :hiddenIds="[sphere.id]")
    .row.full-width
      span.text-white {{sphere}}
    .row.full-widthq.q-py-xl
      q-btn(flat color="red" no-caps @click="deleteStart()") Удалить
</template>

<script>
import { ObjectsApi } from 'src/api/objects'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsSphere_details',
  components: {},
  props: ['sphere'],
  data () {
    return {
    }
  },
  methods: {
    async renameStart () {
      this.$log('renameStart')
      let newName = prompt('New sphere name', this.sphere.name)
      if (newName && newName.length > 0 && newName !== this.sphere.name) {
        this.sphere.name = newName
        // let sphere = await ObjectsApi.getSphere(newName)
        let [sphere] = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
            name: newName,
            objectTypeEnum: { $in: ['CHAR', 'WORD', 'SENTENCE'] }
          },
          populateObjects: false
        })
        this.$log('sphere', sphere)
        if (sphere) {
          this.sphere.oid = sphere.oid
        }
      }
    },
    async deleteStart () {
      this.$log('deleteStart')
      // if we got 0 items on this sphere...
      // await this.$rxdb.remove(this.node.id)
      // this.sphere.deletedAt = Date.now()
      this.$set(this.sphere, 'deletedAt', Date.now())
      await this.sphere.updateExtended('deletedAt', Date.now(), false)
      this.$router.back()
    }
  }
}
</script>
