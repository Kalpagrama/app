<template lang="pug">
insert-emoji(color="grey-8")
</template>

<script>
import insertEmoji from 'components/kalpa_icons/insert_emoji.vue'

export default {
  name: 'nodeEmoji',
  components: {insertEmoji},
  props: ['node'],
}
</script>
