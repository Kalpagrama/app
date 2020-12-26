<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.fit
  //- name
  div(
    :style=`{
      position: 'absolute', zIndex: 100,
      //- bottom: '0px',
      //- ...(() => itemPinned ? {top: '0px'} : {bottom: '0px'})(),
      bottom: '34px',
    }`
    ).row.full-width.justify-center
    span(
      :style=`{
        //- borderRadius: '10px 10px 0 0',
        borderRadius: '10px',
      }`
    ).text-white.bg-black.q-pa-sm {{ item.name }}
  //- preview
  img(
    draggable="false"
    :src="item.thumbUrl"
    :style=`{
      borderRadius: '10px',
      objectFit: 'contain',
    }`
    ).fit.bg-black
</template>

<script>
export default {
  name: 'jointsRowItem',
  props: ['item', 'itemPinned'],
}
</script>
