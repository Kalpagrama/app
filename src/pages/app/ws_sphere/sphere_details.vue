<template lang="pug">
q-page(
  :style=`{paddingTop: '20px', paddingBottom: '400px'}`)
  .row.full-width.items-start.content-start.justify-center
    div(
      :class=`{
        'q-px-sm': $q.screen.width < 800
      }`
      :style=`{maxWidth: '716px', overflow: 'hidden'}`).row.full-width
      //- small.text-white {{sphere}}
      ws-sphere-editor(:item="sphere" :hiddenIds="[sphere.id]")
      .row.full-width.q-mt-xl
          q-btn(outline color="green" no-caps @click="renameStart()") Rename sphere
      .row.full-widthq.q-py-xl
        q-btn(outline color="red" no-caps @click="deletStart()") Delete sphere
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
        let {items: [sphere]} = await this.$rxdb.find({selector: {
            rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
            populateObjects: false,
            name: newName,
            objectTypeEnum: { $in: ['CHAR', 'WORD', 'SENTENCE'] }
        }})
        this.$log('sphere', sphere)
        if (sphere) {
          this.sphere.oid = sphere.oid
        }
      }
    },
    deleteStart () {
      this.$log('deleteStart')
    },
  }
}
</script>
