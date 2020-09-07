<template lang="pug">
.row.full-width.q-px-md
  q-tabs(
    :value="node.layout" @input="node.layout = $event"
    dense no-caps color="white"
    active-color="green"
    align="justify"
    :switch-indicator="false"
    ).full-width
    q-tab(
      name="PIP" icon="picture_in_picture_alt"
      :label="$t('picture_in_picture', 'Картинка в картинке')"
      dense no-caps color="white"
      :style=`{color: 'rgb(180,180,180)'}`)
    q-tab(
      name="HORIZONTAL" icon="compare"
      :label="$t('compare', 'Сравнение')"
      dense no-caps color="white"
      :style=`{color: 'rgb(180,180,180)'}`)
</template>

<script>
export default {
  name: 'editLaout',
  props: ['node'],
}
</script>
