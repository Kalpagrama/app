<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: styles.height,
    }`
  ).row.full-width.items-start.content-start
  slot
  img(
    :src="composition.url"
    :style=`{
      borderRadius: '10px',
      background: 'rgb(40,40,40)',
      height: styles.height,
      objectFit: styles.objectFit,
    }`
    ).full-width
  q-btn(
    :to="'/content/'+composition.layers[0].contentOid"
    round flat color="white" no-caps icon="select_all"
    :style=`{
      position: 'absolute', top: '4px', left: '4px', zIndex: 100,
    }`)
</template>

<script>
export default {
  name: 'typeImage',
  components: {
  },
  props: {
    compositionKey: {type: String},
    composition: {type: Object, required: true},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    isMini: {type: Boolean},
    options: {type: Object},
    styles: {type: Object, default: {}},
  }
}
</script>
