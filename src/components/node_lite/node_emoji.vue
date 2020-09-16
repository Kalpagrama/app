<style lang="sass">
.q-bottom-sheet__item
  max-width: 60px !important
  max-height: 60px !important
.q-bottom-sheet__empty-icon
  display: none !important
</style>

<template lang="pug">
insert-emoji(
  @click.native="start()"
  color="grey-8")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

import insertEmoji from 'components/kalpa_icons/insert_emoji.vue'

export default {
  name: 'nodeEmoji',
  components: {insertEmoji},
  props: ['node'],
  data () {
    return {
      emojiSpheres: []
    }
  },
  computed: {
    actions () {
      return this.emojiSpheres.map(e => {
        return {
          label: e.name,
          id: e.oid,
        }
      })
    }
  },
  methods: {
    async start () {
      this.$log('start')
      this.emojiSpheres = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'emojiSpheres')
      this.$log('emojiSpheres', this.emojiSpheres)
      this.$q.bottomSheet({
        dark: true,
        title: 'Sphere emoji',
        // message: 'Bottom Sheet message',
        grid: true,
        actions: this.actions,
      }).onOk(async (action) => {
        this.$log('Action chosen:', action.id)
        let jointInput = {
          jointType: 'ASSOCIATIVE',
          leftItem: {oid: this.node.oid},
          rightItem: {oid: action.id}
        }
        let joint = await NodeApi.jointCreate(jointInput)
        this.$log('link done joint', joint)
      }).onCancel(() => {
        this.$log('Dismissed')
      }).onDismiss(() => {
        this.$log('I am triggered on both OK and Cancel')
      })
    }
  }
}
</script>
