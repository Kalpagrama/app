<template lang="pug">
q-btn(
  round flat
  :color="color"
  icon="insert_emoticon"
  :style=`{
    position: 'relative',
  }`)
  q-icon(
    name="add" size="14px"
    :color="color"
    :style=`{
      position: 'absolute', zIndex: 100,
      top: '4px', right: '4px',
    }`
    )
</template>

<script>
export default {
  name: 'insertEmoji',
  props: {
    color: {
      type: String,
      default () {
        return 'white'
      }
    }
  }
}
</script>
