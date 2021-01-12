<template lang="pug">
div(
  :style=`{
    position: 'absolute', zIndex: 100,
  }`
  ).row.fit
  //- tint caller
  div(
    v-if="!tintShow"
    @click="tintShow = true"
    :style=`{
      position: 'absolute', zIndex: 101,
    }`
    ).row.fit
  //- tint
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="tintShow"
      @click.self="tintShow = false"
      :style=`{
        position: 'absolute', zIndex: 102,
        background: 'rgba(0,0,0,0.5)',
      }`
      ).row.fit
      //- CONTENT: routerLink: contentName, actions
      div(
        :style=`{
          position: 'absolute', zIndex: 901,
          top: '0px', left: '0px',
          //- ...styles.padding,
        }`
        ).row.full-width.items-center.content-center.q-pa-sm
        router-link(
          :to="'/content/'+contentKalpa.oid"
          :style=`{overflow: 'hidden'}`
          ).col
          q-btn(flat dense color="white" no-caps).row.no-wrap
            q-icon(name="select_all" color="white" size="20px")
            .col
              span(:style=`{whiteSpace: 'nowrap', userSelect: 'none'}`).text-white.q-pl-xs {{ contentKalpa.name }}
</template>

<script>
export default {
  name: 'playerTint',
  props: ['contentKalpa'],
  data () {
    return {
      tintShow: false,
    }
  }
}
</script>
