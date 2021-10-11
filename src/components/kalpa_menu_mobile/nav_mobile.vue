<template lang="pug">
div()
  q-btn(
    @click="$routerKalpa.back()"
    flat color="grey-7" icon="west" no-caps
    :style=`{
      width: '46px',
      height: '46px',
    }`)
    small(:style=`{marginTop: '-2px', whiteSpace: 'nowrap'}`) {{$t('Back')}}
  //- .col
  //- q-btn(
  //  flat color="green" icon="add" no-caps stack
  //  :style=`{
  //    //- width: '70px',
  //    height: '70px',
  //  }`).col
  //  span(:style=`{whiteSpace: 'nowrap'}`).q-mt-sm {{$t('Add joint')}}
  //- .col
  //kalpa-menu-popup-global(
  //  color="grey-7"
  //  :styles=`{width: '46px', height: '46px',}`)
</template>

<script>
export default {
  name: 'navMobile',
  props: ['pageId'],
}
</script>
