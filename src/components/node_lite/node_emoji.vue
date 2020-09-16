<template lang="pug">
insert-emoji(
  @click.native="start()"
  color="grey-8")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

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
  methods: {
    async start () {
      this.$log('start')
      this.emojiSpheres = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'emojiSpheres')
      this.$log('emojiSpheres', this.emojiSpheres)
    }
  }
}
</script>
